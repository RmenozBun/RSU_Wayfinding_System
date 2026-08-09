import math
def haversine(lat1, lng1, lat2, lng2):
    # distance between latitudes and longitudes
    dLat = (lat2 - lat1) * math.pi / 180.0
    dLng = (lng2 - lng1) * math.pi / 180.0
    # convert to radians
    lat1 = lat1 * math.pi / 180.0
    lat2 = lat2 * math.pi / 180.0
    # apply formulae
    a = (
        pow(math.sin(dLat / 2), 2)
        + pow(math.sin(dLng / 2), 2)
        * math.cos(lat1)
        * math.cos(lat2)
    )
    rad = 6371  # Earth radius (km)
    c = 2 * math.asin(math.sqrt(a))
    return rad * c