export interface INode {
  id: string;
  left: number;
  right: number;
  depth: number;
}

const getDirectChildren = <T extends INode>(nodes: T[], parent: T) =>
  nodes.filter(
    (child) =>
      child.left > parent.left &&
      child.right < parent.right &&
      child.depth === parent.depth + 1
  );

const isAncestor = <T extends INode>(node: T, candidate: T): boolean =>
  candidate.left < node.left && node.right < candidate.right;

const isDescendant = <T extends INode>(node: T, candidate: T): boolean =>
  node.left < candidate.left && candidate.right < node.right;

const isDirectChild = <T extends INode>(node: T, candidate: T) =>
  isDescendant(node, candidate) && node.depth + 1 === candidate.depth;

export const Node = {
  getDirectChildren,
  isAncestor,
  isDescendant,
  isDirectChild,
};
