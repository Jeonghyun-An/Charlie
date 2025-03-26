export type OrgItem = {
    id: number;
    name: string;
    parent: number | null;
    cid: number; // 회사 ID
    depth: number;
};

export type OrgMember = {
    name: string;
    userId: string;
    teamId: number;
    position?: string;
};
