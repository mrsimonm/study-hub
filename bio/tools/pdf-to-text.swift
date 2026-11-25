import PDFKit
let a = CommandLine.arguments
guard let d = PDFDocument(url: URL(fileURLWithPath: a[1])) else { print("fail"); exit(1) }
var out = ""
for i in 0..<d.pageCount { out += "\n=== SLIDE \(i+1) ===\n" + (d.page(at: i)?.string ?? "") }
try! out.write(toFile: a[2], atomically: true, encoding: .utf8)
print(d.pageCount, out.count)
