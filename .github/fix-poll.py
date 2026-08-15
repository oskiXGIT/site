from pathlib import Path

p = Path('poll.js')
text = p.read_text(encoding='utf-8')
text = text.replace("  const totalEl = document.getElementById('pollTotal');\n", "  const totalEl = document.getElementById('pollTotal');\n  const totalLabelEl = document.getElementById('pollTotalLabel');\n", 1)
text = text.replace("  let poll = null;\n  let selected = null;\n", "  let poll = null;\n  let selected = null;\n  let renderedVersion = null;\n", 1)
text = text.replace("    if (privacyEl) privacyEl.textContent = t.privacy;\n    if (voteBtn) voteBtn.textContent = t.vote;\n", "    if (privacyEl) privacyEl.textContent = t.privacy;\n    if (totalLabelEl) totalLabelEl.textContent = t.total;\n    if (voteBtn) voteBtn.textContent = t.vote;\n", 1)
text = text.replace("    questionEl.textContent = poll.question;\n    totalEl.textContent = String(poll.total || 0);\n", "    if (renderedVersion !== poll.version) {\n      renderedVersion = poll.version;\n      selected = null;\n    }\n\n    questionEl.textContent = poll.question;\n    totalEl.textContent = String(poll.total || 0);\n", 1)
text = text.replace("already:'TU JAU BALSAIVAI. ANTRA KARTA NELEIDZIA SITAS BROWSERIS.'", "already:'TU JAU BALSAVAI. ANTRA KARTA NELEIDZIA SITAS BROWSERIS.'", 1)
text = text.replace("NESAUgomi", "NESAUGOMI", 1)
p.write_text(text, encoding='utf-8')

for temp in [Path('.github/fix-poll.py'), Path('.github/workflows/fix-poll.yml')]:
    if temp.exists(): temp.unlink()
