LAYER_CONFIG = {
    "Runway": {"color": 2, "lineweight": 50},
    "Taxiway": {"color": 2, "lineweight": 50},
    "Stopway": {"color": 30, "lineweight": 25},
    "Apron": {"color": 6, "lineweight": 25},
    "Building": {"color": 7, "lineweight": 25},
    "Hangar": {"color": 8, "lineweight": 25},
    "Parking_Position": {"color": 7, "lineweight": 25},
    "Grass": {"color": 3, "lineweight": 25},
    # "Aerodrome": {"color": 7, "lineweight": 25},
    "Unclassified": {"color": 1, "lineweight": 25},
}

RENDER_TYPE = {
    "Runway": "polygon",
    "Taxiway": "polygon",
    "Apron": "polygon",
    "Building": "polygon",
    "Terminal": "polygon",
    "Hangar": "polygon",
    "Grass": "polygon",
    "Aerodrome": "polygon",

    "Parking_Position": "line",
    "Stopway": "line",

    "Unclassified": "line",
}

# LAYER_CONFIG = {
#     "Runway": {"color": 2, "lineweight": 50},  # Yellow
#     "Taxiway": {"color": 2, "lineweight": 50},  # Yellow
#     "Stopway": {"color": 30, "lineweight": 25},  # Orange-ish (closest match)
#     "Apron": {"color": 6, "lineweight": 25},  # Magenta
#     "Building": {"color": 7, "lineweight": 25},  # White/Black (depends on background)
#     "Terminal": {"color": 7, "lineweight": 25},        
#     "Hangar": {"color": 8, "lineweight": 25},  # Gray
#     "Parking_Position": {"color": 7, "lineweight": 25},  # White

#     "Grass": {"color": 3, "lineweight": 25},  # Green
#     "Aerodrome": {"color": 7, "lineweight": 25},  # White/Black boundary
#     "Unclassified": {
#         "color": 1,
#         "lineweight": 25,
#     },  # Red (Alerts you to "unknown" data)

# }

# Contrast colours for better comparison visibility:

# LAYER_CONFIG = {
#     "Runway": {"color": 1, "lineweight": 50},            # Red
#     "Taxiway": {"color": 5, "lineweight": 50},           # Blue
#     "Stopway": {"color": 30, "lineweight": 25},          # Orange
#     "Apron": {"color": 6, "lineweight": 25},             # Magenta
#     "Terminal": {"color": 4, "lineweight": 25},          # Cyan
#     "Hangar": {"color": 8, "lineweight": 25},            # Gray
#     "Parking_Position": {"color": 7, "lineweight": 25},  # White
#     "Grass": {"color": 3, "lineweight": 25},             # Green
#     "Aerodrome": {"color": 2, "lineweight": 25},         # Yellow
#     "Unclassified": {"color": 9, "lineweight": 25},      # Light Gray
# }