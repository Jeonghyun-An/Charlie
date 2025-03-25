export interface TreeNodeItem {
    name: string;
    type: "team" | "member" | "company" | "department";
    id: string;
    path?: string[];
    position?: string;
    children?: TreeNodeItem[];
}
