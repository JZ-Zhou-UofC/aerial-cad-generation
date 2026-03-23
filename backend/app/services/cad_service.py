import ezdxf
from app.utils.cad.layers import LAYER_CONFIG
from app.utils.cad.detect import detect_feature
from app.utils.cad.renderer import render_way, render_relation, ensure_layer,should_render
from app.utils.cad.relations import build_element_map
from app.utils.cad.geometry import latlon_to_pixel_xy


def export_to_cad(geo_data, output_path, max_lat, min_lon, zoom,active_layers: list[str] | None = None):
    origin_x, origin_y = latlon_to_pixel_xy(max_lat, min_lon, zoom)

    doc = ezdxf.new(setup=True)
    msp = doc.modelspace()
    doc.header["$INSUNITS"] = 0

    elements = geo_data.get("elements", []) if isinstance(geo_data, dict) else geo_data
    element_map = build_element_map(elements)

    processed = 0

    for el in elements:
        tags = el.get("tags", {})

        feature = detect_feature(tags)
        layer_name = feature if feature else "Unclassified"
        if not should_render(layer_name, active_layers):
            continue
        config = LAYER_CONFIG.get(layer_name, LAYER_CONFIG["Unclassified"])
        ensure_layer(doc, layer_name, config)
        
        if el.get("type") == "relation":
            processed += render_relation(
                el, msp, layer_name, config,
                origin_x, origin_y, zoom, element_map
            )
        else:
            processed += render_way(
                el, msp, layer_name, config,
                origin_x, origin_y, zoom
            )

    doc.saveas(output_path)
    print(f"CAD export complete: {processed} features")