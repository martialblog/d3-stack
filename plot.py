import numpy as np
import scipy
import py_stringmatching as sm
import plotly.figure_factory as ff

INPUT = "/home/markus/github/histnorm/datasets/historical/german/german-anselm.train.txt"

with open(INPUT, "r", encoding="utf-8") as infile:
    text = [line.strip().split("\t")[1] for line in infile]

n = 500 # number of tokens

sim = sm.Levenshtein()

examples = list(set(text[:n]))
print(len(examples))

tokens = np.array(examples).reshape(-1,1)
matrix = scipy.spatial.distance.pdist(tokens, lambda x,y: sim.get_raw_score(str(x[0]),str(y[0])))

linkage_method = "ward"
model = scipy.cluster.hierarchy.linkage(matrix, linkage_method)

from functools import reduce
from json import dump

labels = dict(enumerate(examples))

def add_nodes(node, parent):
    # Recursively build tree as dict
    new_node = dict(node_id=node.id, children=[], distance=node.dist)
    parent["children"].append(new_node)
    if node.left: add_nodes(node.left, new_node)
    if node.right: add_nodes(node.right, new_node)

def add_labels(node):
    # Recursively add labels to the tree
    is_leaf = len(node["children"]) == 0

    if is_leaf:
        node["name"] = labels[node["node_id"]]
    else:
        # node["name"] = "foo"
        list(map(add_labels, node["children"]))
    del node["node_id"]

scipy_tree = scipy.cluster.hierarchy.to_tree(model, rd=False)
tree = dict(children=[], name="root", distance=scipy_tree.dist)

add_nodes(scipy_tree, tree)
add_labels(tree["children"][0])

dump(tree, open("/tmp/dendrogram.json", "w"), sort_keys=True, indent=2)
