export interface TreeNodeItem {
    name: string;
    type: "company" | "team" | "department" | "member";
    id: string;
    position?: string;
    path?: string[];
    children?: TreeNodeItem[];
}
