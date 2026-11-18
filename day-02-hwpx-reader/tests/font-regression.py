#!/usr/bin/env python3
"""Check that bundled punctuation fallback covers HWPX halfwidth quotes."""
import pathlib, subprocess
root = pathlib.Path(__file__).resolve().parent.parent
font = root/'vendor'/'punctuation.ttf'
assert font.exists(), 'Bundled glyph fallback is missing'
charset = subprocess.check_output(['fc-query','--format=%{charset}',str(font)],text=True).lower()
def contains(cp):
    for block in charset.split():
        ends=block.split('-'); lo=int(ends[0],16); hi=int(ends[-1],16)
        if lo <= cp <= hi: return True
    return False
assert contains(0xff62) and contains(0xff63), 'HWPX quotation marks are missing'
print('HWPX halfwidth quotation marks present')
