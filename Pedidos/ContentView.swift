import SwiftUI
import WebKit
import UIKit
import AudioToolbox

struct ContentView: View {
    var body: some View {
        WebContainer()
            .background(Color(red: 0.231, green: 0.180, blue: 0.165))
    }
}

/// 数据目录: 应用的 Documents/订货单 （在“文件”App 里可见，UIFileSharingEnabled）
enum Store {
    static var dir: URL = {
        let d = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("订货单", isDirectory: true)
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }()
    static var dataURL: URL { dir.appendingPathComponent("pedidos_data.json") }
    static var backupDir: URL {
        let d = dir.appendingPathComponent("backups", isDirectory: true)
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }

    static func read() -> [String: Any]? {
        guard let data = try? Data(contentsOf: dataURL),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              obj["orders"] is [Any] else { return nil }
        return obj
    }

    /// 与桌面启动器一致: 带版本号。版本不一致返回 409 + 最新数据。
    static func write(_ body: Data) -> (Int, Data) {
        guard var new = (try? JSONSerialization.jsonObject(with: body)) as? [String: Any],
              new["orders"] is [Any] else { return (400, Data("{\"error\":\"bad format\"}".utf8)) }
        let cur = read()
        let curRev = (cur?["rev"] as? Int) ?? 0
        let clientRev = (new["rev"] as? Int) ?? 0
        if let cur = cur, clientRev != curRev {
            var c = cur; c["rev"] = curRev
            return (409, (try? JSONSerialization.data(withJSONObject: c)) ?? Data())
        }
        lock.lock(); defer { lock.unlock() }
        backup()
        new["rev"] = curRev + 1
        guard let out = try? JSONSerialization.data(withJSONObject: new, options: [.prettyPrinted]) else {
            return (500, Data())
        }
        do { try out.write(to: dataURL, options: .atomic) } catch { return (500, Data()) }
        return (200, Data("{\"ok\":true,\"rev\":\(curRev + 1)}".utf8))
    }

    static let lock = NSLock()
    static func prune() {
        let fm = FileManager.default
        let files = ((try? fm.contentsOfDirectory(atPath: backupDir.path)) ?? [])
            .filter { $0.hasPrefix("pedidos_") && $0.hasSuffix(".json") }.sorted()
        var keep = Set(files.suffix(40))
        var days: [String: String] = [:]
        for f in files { days[String(f.dropFirst(8).prefix(8))] = f }
        for d in days.keys.sorted().suffix(14) { if let f = days[d] { keep.insert(f) } }
        for f in files where !keep.contains(f) { try? fm.removeItem(at: backupDir.appendingPathComponent(f)) }
    }

    @discardableResult
    static func backup(label: String? = nil, force: Bool = false) -> String? {
        let fm = FileManager.default
        guard fm.fileExists(atPath: dataURL.path) else { return nil }
        let files = ((try? fm.contentsOfDirectory(atPath: backupDir.path)) ?? []).sorted()
        if !force, let last = files.last,
           let attrs = try? fm.attributesOfItem(atPath: backupDir.appendingPathComponent(last).path),
           let m = attrs[.modificationDate] as? Date, Date().timeIntervalSince(m) < 60 { return nil }
        let f = DateFormatter(); f.dateFormat = "yyyyMMdd_HHmmss"; f.locale = Locale(identifier: "en_US_POSIX")
        let name = "pedidos_\(f.string(from: Date()))" + (label.map { "_" + $0 } ?? "") + ".json"
        try? fm.copyItem(at: dataURL, to: backupDir.appendingPathComponent(name))
        prune()
        return name
    }

    static func listBackups() -> [[String: Any]] {
        let fm = FileManager.default
        let files = ((try? fm.contentsOfDirectory(atPath: backupDir.path)) ?? [])
            .filter { $0.hasPrefix("pedidos_") && $0.hasSuffix(".json") }.sorted(by: >)
        return files.map { f in
            let u = backupDir.appendingPathComponent(f)
            let size = ((try? fm.attributesOfItem(atPath: u.path))?[.size] as? Int) ?? 0
            var n = -1
            if let d = try? Data(contentsOf: u), let o = (try? JSONSerialization.jsonObject(with: d)) as? [String: Any],
               let a = o["orders"] as? [Any] { n = a.count }
            let label = f.count > 29 ? String(f.dropFirst(24).dropLast(5)) : ""
            return ["name": f, "size": size, "orders": n, "label": label]
        }
    }

    static func restore(_ name: String) -> (Int, Data) {
        guard !name.contains("/"), !name.contains(".."), name.hasPrefix("pedidos_"),
              let d = try? Data(contentsOf: backupDir.appendingPathComponent(name)),
              var o = (try? JSONSerialization.jsonObject(with: d)) as? [String: Any],
              o["orders"] is [Any] else { return (400, Data("{\"error\":\"bad backup\"}".utf8)) }
        lock.lock(); defer { lock.unlock() }
        let curRev = (read()?["rev"] as? Int) ?? 0
        backup(label: "pre-restore", force: true)
        o["rev"] = curRev + 1
        guard let out = try? JSONSerialization.data(withJSONObject: o, options: [.prettyPrinted]),
              (try? out.write(to: dataURL, options: .atomic)) != nil else { return (500, Data()) }
        return (200, Data("{\"ok\":true,\"rev\":\(curRev + 1)}".utf8))
    }
}

/// app://local/...  内置页面与 /api/data 接口
final class SchemeHandler: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url else { task.didFailWithError(URLError(.badURL)); return }
        let path = url.path
        func send(_ code: Int, _ data: Data, _ mime: String) {
            let h = ["Content-Type": mime, "Content-Length": "\(data.count)", "Cache-Control": "no-store"]
            let r = HTTPURLResponse(url: url, statusCode: code, httpVersion: "HTTP/1.1", headerFields: h)!
            task.didReceive(r); task.didReceive(data); task.didFinish()
        }
        func readBody() -> Data? {
            var body = task.request.httpBody
            if body == nil, let s = task.request.httpBodyStream {
                s.open(); var d = Data(); let buf = UnsafeMutablePointer<UInt8>.allocate(capacity: 65536)
                while s.hasBytesAvailable { let n = s.read(buf, maxLength: 65536); if n <= 0 { break }; d.append(buf, count: n) }
                buf.deallocate(); s.close(); body = d
            }
            return body
        }
        let json = "application/json; charset=utf-8"
        if path == "/api/backups" {
            let d = (try? JSONSerialization.data(withJSONObject: ["list": Store.listBackups()])) ?? Data("{\"list\":[]}".utf8)
            send(200, d, json); return
        }
        if path == "/api/snapshot" {
            let q = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems?.first { $0.name == "label" }?.value ?? "manual"
            let label = String(q.filter { $0.isLetter || $0.isNumber || $0 == "-" }.prefix(20))
            Store.lock.lock(); let n = Store.backup(label: label.isEmpty ? "manual" : label, force: true); Store.lock.unlock()
            send(200, Data("{\"ok\":true,\"name\":\"\(n ?? "")\"}".utf8), json); return
        }
        if path == "/api/restore" {
            let name = ((try? JSONSerialization.jsonObject(with: readBody() ?? Data())) as? [String: Any])?["name"] as? String ?? ""
            let (code, out) = Store.restore(name)
            send(code, out, json); return
        }
        if path == "/api/data" {
            if task.request.httpMethod == "POST" {
                let body = readBody()
                let (code, out) = Store.write(body ?? Data())
                send(code, out, "application/json; charset=utf-8")
            } else if let o = Store.read(), let d = try? JSONSerialization.data(withJSONObject: o) {
                send(200, d, "application/json; charset=utf-8")
            } else {
                send(200, Data("{\"orders\":[],\"fresh\":true,\"rev\":0}".utf8), "application/json; charset=utf-8")
            }
            return
        }
        let name = (path == "/" || path.isEmpty) ? "pedidos.html" : String(path.dropFirst())
        let found = Bundle.main.url(forResource: "Web/" + name, withExtension: nil)
            ?? Bundle.main.url(forResource: name, withExtension: nil)
        if let f = found, let d = try? Data(contentsOf: f) {
            send(200, d, name.hasSuffix(".html") ? "text/html; charset=utf-8" : "application/octet-stream")
        } else {
            send(404, Data("not found".utf8), "text/plain")
        }
    }
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

struct WebContainer: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let cfg = WKWebViewConfiguration()
        cfg.setURLSchemeHandler(SchemeHandler(), forURLScheme: "app")
        let uc = WKUserContentController()
        uc.add(context.coordinator, name: "native")
        uc.addUserScript(WKUserScript(source: "window.__NATIVE__=true;", injectionTime: .atDocumentStart, forMainFrameOnly: true))
        cfg.userContentController = uc
        let wv = WKWebView(frame: .zero, configuration: cfg)
        wv.uiDelegate = context.coordinator
        wv.scrollView.contentInsetAdjustmentBehavior = .never
        wv.scrollView.bounces = false
        wv.isOpaque = false
        wv.backgroundColor = UIColor(red: 0.984, green: 0.957, blue: 0.918, alpha: 1)
        wv.scrollView.backgroundColor = wv.backgroundColor
        context.coordinator.web = wv
        wv.load(URLRequest(url: URL(string: "app://local/pedidos.html")!))
        return wv
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKScriptMessageHandler, WKUIDelegate {
        weak var web: WKWebView?

        let light = UIImpactFeedbackGenerator(style: .light)
        let medium = UIImpactFeedbackGenerator(style: .medium)
        let select = UISelectionFeedbackGenerator()
        let notify = UINotificationFeedbackGenerator()

        func fx(_ kind: String, haptic: Bool, sound: Bool) {
            if haptic {
                switch kind {
                case "tick": light.impactOccurred()
                case "sel": select.selectionChanged()
                case "add": medium.impactOccurred()
                case "warn": notify.notificationOccurred(.warning)
                case "ok": notify.notificationOccurred(.success)
                default: light.impactOccurred()
                }
            }
            if sound {
                // 系统自带键盘/锁屏类短音，随静音开关和系统音量
                let id: SystemSoundID
                switch kind {
                case "tick": id = 1104
                case "sel": id = 1104
                case "add": id = 1057
                case "warn": id = 1053
                case "ok": id = 1025
                default: id = 1104
                }
                AudioServicesPlaySystemSound(id)
            }
        }

        func userContentController(_ uc: WKUserContentController, didReceive m: WKScriptMessage) {
            guard let d = m.body as? [String: Any], let type = d["type"] as? String else { return }
            if type == "fx" {
                fx(d["kind"] as? String ?? "tick", haptic: d["haptic"] as? Bool ?? true, sound: d["sound"] as? Bool ?? true)
                return
            }
            if type == "theme" {
                let mode = d["mode"] as? String ?? "auto"
                let dark = d["dark"] as? Bool ?? false
                DispatchQueue.main.async {
                    let bg = dark ? UIColor(red: 0.09, green: 0.075, blue: 0.063, alpha: 1)
                                  : UIColor(red: 0.984, green: 0.957, blue: 0.918, alpha: 1)
                    self.web?.backgroundColor = bg
                    self.web?.scrollView.backgroundColor = bg
                    let style: UIUserInterfaceStyle = mode == "dark" ? .dark : (mode == "light" ? .light : .unspecified)
                    UIApplication.shared.connectedScenes.compactMap { ($0 as? UIWindowScene)?.keyWindow }.forEach { $0.overrideUserInterfaceStyle = style }
                }
                return
            }
            if type == "shareText", let text = d["text"] as? String {
                DispatchQueue.main.async {
                    let vc = UIActivityViewController(activityItems: [text], applicationActivities: nil)
                    guard let root = UIApplication.shared.connectedScenes.compactMap({ ($0 as? UIWindowScene)?.keyWindow }).first?.rootViewController else { return }
                    var top = root; while let p = top.presentedViewController { top = p }
                    vc.popoverPresentationController?.sourceView = top.view
                    vc.popoverPresentationController?.sourceRect = CGRect(x: top.view.bounds.midX, y: top.view.bounds.maxY - 40, width: 1, height: 1)
                    top.present(vc, animated: true)
                }
                return
            }
            guard type == "save",
                  let name = d["name"] as? String, let b64 = d["b64"] as? String,
                  let data = Data(base64Encoded: b64) else { return }
            let safe = name.replacingOccurrences(of: "/", with: "_")
            let url = FileManager.default.temporaryDirectory.appendingPathComponent(safe)
            try? data.write(to: url, options: .atomic)
            DispatchQueue.main.async {
                let vc = UIActivityViewController(activityItems: [url], applicationActivities: nil)
                guard let root = UIApplication.shared.connectedScenes.compactMap({ ($0 as? UIWindowScene)?.keyWindow }).first?.rootViewController else { return }
                var top = root; while let p = top.presentedViewController { top = p }
                vc.popoverPresentationController?.sourceView = top.view
                vc.popoverPresentationController?.sourceRect = CGRect(x: top.view.bounds.midX, y: top.view.bounds.maxY - 40, width: 1, height: 1)
                top.present(vc, animated: true)
            }
        }

        // 原生 confirm()/alert()/prompt() 支持（WKWebView 默认不弹）
        func webView(_ w: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame f: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in completionHandler(false) })
            a.addAction(UIAlertAction(title: "确定", style: .default) { _ in completionHandler(true) })
            UIApplication.shared.connectedScenes.compactMap { ($0 as? UIWindowScene)?.keyWindow }.first?.rootViewController?.present(a, animated: true)
        }
        func webView(_ w: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame f: WKFrameInfo, completionHandler: @escaping () -> Void) {
            let a = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            a.addAction(UIAlertAction(title: "好", style: .default) { _ in completionHandler() })
            UIApplication.shared.connectedScenes.compactMap { ($0 as? UIWindowScene)?.keyWindow }.first?.rootViewController?.present(a, animated: true)
        }
    }
}
