def create_node_lookup(nodes):
    return {
        node["id"]: node
        for node in nodes
    }