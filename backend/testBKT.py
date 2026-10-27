from ml_service import bkt_update

p = 0.2
p1 = bkt_update(p, False)
p2 = bkt_update(p1, True)
p3 = bkt_update(p2, True)
assert 0 <= p1 <= 1 and 0 <= p2 <= 1 and 0 <= p3 <= 1
assert p3 > p1
print('BKT tests passed:', {'after_wrong': round(p1,3), 'after_two_correct': round(p3,3)})
