from app.utils.cad.layers import LAYER_CONFIG


def detect_feature(tags: dict) -> str | None:
    if not tags:
        return None

    if tags.get("building"):
        return "Building"

    aeroway = tags.get("aeroway")
    if aeroway:
        key = aeroway.strip().lower()
        for layer in LAYER_CONFIG.keys():
            if key == layer.lower():
                return layer

    if (
        tags.get("landcover") == "grass"
        or tags.get("landuse") == "grass"
        or tags.get("natural") == "grassland"
        or (tags.get("aeroway") and tags.get("surface") == "grass")
    ):
        return "Grass"

    return None