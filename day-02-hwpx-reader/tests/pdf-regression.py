#!/usr/bin/env python3
"""Check exported PDF evidence from public-agency HWPX fixtures.
Usage: python3 tests/pdf-regression.py /path/to/exports
Requires files msit.pdf, uiwang.pdf, bupyeong.pdf, iksan.pdf and Poppler tools.
"""
import pathlib, subprocess, sys
root = pathlib.Path(sys.argv[1])
def run(*args):
    return subprocess.check_output(args, text=True)
# The Uiwang cover image used to disappear during PDF export.
images = run('pdfimages', '-f', '1', '-l', '1', '-list', str(root/'uiwang.pdf'))
assert any(line.strip().startswith('1 ') for line in images.splitlines()), 'Uiwang cover image missing'
# Duplicate SVG clip IDs previously clipped the entire privacy notice.
text = run('pdftotext', '-f', '4', '-l', '4', str(root/'bupyeong.pdf'), '-')
assert '개인정보의 수집 및 이용목적' in text, 'privacy notice missing'
assert '권리가 있습니다' in text, 'privacy rights text missing'
# Both opening and closing halfwidth brackets must survive PDF generation.
iksan = run('pdftotext', '-f', '1', '-l', '1', str(root/'iksan.pdf'), '-')
assert '｢' in iksan and '｣' in iksan, 'halfwidth brackets missing from PDF'
print('PDF image, privacy-notice and punctuation regressions passed')
