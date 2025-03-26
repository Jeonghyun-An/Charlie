import type { OrgMember } from "./data";

export interface TreeNodeItem {
    name: string;
    type: "company" | "team" | "department" | "member";
    id: string;
    position?: string;
    path?: string[];
    children?: TreeNodeItem[];
}
export interface OrgTreeNode {
    id: number;
    name: string;
    type: "team" | "company";
    children?: OrgTreeNode[];
    members?: OrgMember[];
}
