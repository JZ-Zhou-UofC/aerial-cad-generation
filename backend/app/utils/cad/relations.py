
def build_element_map(elements):
    return {el["id"]: el for el in elements}


def extract_relation_polygons(relation, element_map):
    outers = []
    inners = []

    for member in relation.get("members", []):
        child = element_map.get(member["ref"])
        if not child:
            continue

        geometry = child.get("geometry")
        if not geometry:
            continue

        coords = [(pt["lat"], pt["lon"]) for pt in geometry]

        role = member.get("role")
        if role == "outer":
            outers.append(coords)
        elif role == "inner":
            inners.append(coords)

    return outers, inners