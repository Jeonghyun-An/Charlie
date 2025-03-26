import type { OrgItem, OrgMember } from "@/types/data";
import type { OrgTreeNode } from "@/types/tree";

export function buildOrgTree(
    items: OrgItem[],
    members: OrgMember[]
): OrgTreeNode[] {
    const itemMap = new Map<number, OrgTreeNode>();

    // 1. 모든 팀/조직 항목을 먼저 Map으로 생성
    items.forEach((item) => {
        itemMap.set(item.id, {
            id: item.id,
            name: item.name,
            type: item.depth === 0 ? "company" : "team",
            children: [],
            members: [],
        });
    });

    const rootNodes: OrgTreeNode[] = [];

    // 2. 부모-자식 관계 연결
    items.forEach((item) => {
        const node = itemMap.get(item.id)!;

        if (item.parent === null || !itemMap.has(item.parent)) {
            rootNodes.push(node);
        } else {
            const parentNode = itemMap.get(item.parent)!;
            parentNode.children = parentNode.children || [];
            parentNode.children.push(node);
        }
    });

    // 3. 멤버들을 해당 팀에 추가
    members.forEach((member) => {
        const teamNode = itemMap.get(member.teamId);
        if (teamNode) {
            teamNode.members = teamNode.members || [];
            teamNode.members.push(member);
        }
    });

    return rootNodes;
}
