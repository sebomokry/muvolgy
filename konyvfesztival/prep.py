import json,re
from collections import Counter
r=json.load(open("raw.json"))
def norm_venue(v):
    v=v.replace("Budapest Kongresszusi Központ ","").strip()
    if re.fullmatch(r'GY\d+',v): v+=" stand"
    v=re.sub(r'\s*–\s*',' – ',v)
    return v
def zone(v):
    if "dedikálópont" in v: return "dedik"
    if v.endswith("stand") and not v.startswith("Díszvendég"): return "stand"
    if v.startswith("Díszvendég"): return "guest"
    if v.startswith(("Képregény","Gyerek")): return "kids"
    return "hall"
def tags(e):
    t=[]; txt=(e["title"]+" "+e["desc"]).lower()
    if e["series"]=="NÉMET NYELVŰ DÍSZVENDÉGSÉG" or e["venue"].startswith("Díszvendég"): t.append("guest")
    if e["series"]=="ÍR FÓKUSZ": t.append("irish")
    if e["venue"].startswith("Gyerek") or re.search(r'\d+\s*[–-]\s*\d+\s*éve|éves kortól|éveseknek|kortól ajánl|gyerekeknek|óvodás|kisiskolás|családi program|workshop gyerek',txt): t.append("kids")
    if e["venue"].startswith("Képregény") or "képregény" in txt: t.append("comics")
    if re.search(r'tolmácsolással|szinkrontolmács|konszekutív tolmács',txt): t.append("interp")
    return t
venues={}
out=[]
for i,e in enumerate(r):
    if e["kind"]=="signing": e["venue"]=e["venue"]
    v=norm_venue(e["venue"])
    venues.setdefault(v,zone(v))
    out.append({"id":i+1,"d":e["day"],"s":e["start"],"e":e["end"],"v":v,"t":e["title"],"sr":(e["series"] or "").capitalize() or None,
                "ds":e["desc"],"o":e["org"],"k":"p" if e["kind"]=="program" else "s","tg":tags(e) if e["kind"]=="program" else []})
print(Counter(t for o in out for t in o["tg"]))
print(Counter(venues.values()))
print(len(venues))
FIX={"időkcímű":"idők című","GarabonciásokVarjúlányok":"Garabonciások Varjúlányok","indultakOktóberi":"indultak Októberi","HullámtörésTwo":"Hullámtörés Two"}
for o in out:
    for f in ("t","ds"):
        for a,b in FIX.items(): o[f]=o[f].replace(a,b)
json.dump({"programs":out,"venues":venues},open("data.json","w"),ensure_ascii=False,separators=(",",":"))
import os; print(os.path.getsize("data.json"))
print([o["t"] for o in out if "kids" in o["tg"]][:12])
