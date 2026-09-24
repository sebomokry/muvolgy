"""Inject data.json into template.html -> public/konyvfesztival/index.html (served at /konyvfesztival)."""
import os
here = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(here, "template.html"), encoding="utf-8").read()
d = open(os.path.join(here, "data.json"), encoding="utf-8").read()
out = os.path.join(here, "..", "public", "konyvfesztival", "index.html")
open(out, "w", encoding="utf-8").write(t.replace("/*DATA*/", d))
print("wrote", os.path.relpath(out, os.path.join(here, "..")))
