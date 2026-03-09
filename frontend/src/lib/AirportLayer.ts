import { fetchAirportData } from "./overpass";
import { aerowayStyles } from "./styles";
import { renderDefault } from "./renderers";

export default class AirportLayer {
    map: google.maps.Map;

    layers: Record<string, google.maps.MVCObject[]> = {};

    constructor(map: google.maps.Map) {
        this.map = map;
    }

    clear() {
        Object.values(this.layers).forEach((list) =>
            list.forEach((o: any) => o.setMap(null))
        );

        this.layers = {};
    }

    addOverlay(feature: string, overlay: google.maps.MVCObject) {
        if (!this.layers[feature]) {
            this.layers[feature] = [];
        }

        this.layers[feature].push(overlay);
    }

    async load(features: string[]) {
        const bounds = this.map.getBounds();
        if (!bounds) return;

        const data = await fetchAirportData(features, bounds);
        if (!data?.elements?.length) return;

        data.elements.forEach((el: any) => {
            this.renderElement(el);
        });
    }

    renderElement(el: any) {
        if (!el?.geometry || !el?.tags?.aeroway) return;

        const feature = el.tags.aeroway;
        const style = aerowayStyles[feature];
        if (!style) return;

        let renderStyle = style;

        if (feature === "runway" || feature === "taxiway") {
            renderStyle = { ...style, render: "line" };
        }

        const overlay = renderDefault(this.map, el, renderStyle);

        if (overlay) {
            this.addOverlay(feature, overlay);
        }
    }

    setVisible(feature: string, visible: boolean) {
        const overlays = this.layers[feature];
        if (!overlays) return;

        overlays.forEach((o: any) =>
            o.setMap(visible ? this.map : null)
        );
    }

    toggle(feature: string) {
        const overlays = this.layers[feature];
        if (!overlays?.length) return;

        const visible = overlays[0].getMap() !== null;

        overlays.forEach((o: any) =>
            o.setMap(visible ? null : this.map)
        );
    }
}