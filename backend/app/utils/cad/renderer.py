from app.utils.cad.geometry import convert_to_pixels, simplify
from app.utils.cad.relations import extract_relation_polygons
from app.utils.cad.layers import RENDER_TYPE


def ensure_layer(doc, layer_name, config):
    if layer_name not in doc.layers:
        doc.layers.add(
            name=layer_name,
            color=config["color"],
            lineweight=config.get("lineweight"),
        )


def draw_polyline(msp, points, layer_name, closed=False):
    poly = msp.add_lwpolyline(points, dxfattribs={"layer": layer_name})
    poly.closed = closed
    return poly


def render_way(feature, msp, layer_name, config, origin_x, origin_y, zoom):
    geometry = feature.get("geometry")
    if not geometry:
        return 0

    coords = [(pt["lat"], pt["lon"]) for pt in geometry]
    pts = convert_to_pixels(coords, origin_x, origin_y, zoom)
    pts = simplify(pts)

    if len(pts) < 2:
        return 0

    render_type = RENDER_TYPE.get(layer_name, "line")

    closed = False
    if render_type == "polygon" and pts[0] == pts[-1]:
        closed = True

    draw_polyline(msp, pts, layer_name, closed)
    return 1


def render_relation(feature, msp, layer_name, config, origin_x, origin_y, zoom, element_map):
    outers, inners = extract_relation_polygons(feature, element_map)

    count = 0
    render_type = RENDER_TYPE.get(layer_name, "line")

    for outer in outers:
        pts = convert_to_pixels(outer, origin_x, origin_y, zoom)
        pts = simplify(pts)

        if len(pts) < 2:
            continue

        closed = render_type == "polygon"
        draw_polyline(msp, pts, layer_name, closed)
        count += 1

    return count

def should_render(layer_name: str, active_layers: set | None) -> bool:
    """
    Returns True if this feature should be rendered.
    - If active_layers is None → render everything
    - Otherwise only render selected layers
    """
    if active_layers is None:
        return True

    return layer_name.lower() in active_layers