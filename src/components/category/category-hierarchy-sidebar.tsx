'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuCategory, MenuSubCategory, MenuSubSubCategory } from '@/lib/types/category';

interface CategoryHierarchySidebarProps {
  menuTree: MenuCategory[];
  currentSlug: string;
  onSelect: (slug: string) => void;
}

interface TreeNode {
  id: number;
  slug: string;
  name: string;
  depth: number;
  children: TreeNode[];
}

function buildFlatPath(menuTree: MenuCategory[], targetSlug: string): TreeNode[] {
  for (const cat of menuTree) {
    if (cat.slug === targetSlug) {
      const children = cat.children?.map((sub) => ({
        id: sub.id,
        slug: sub.slug,
        name: sub.name,
        depth: 1,
        children: sub.children?.map((ss) => ({
          id: ss.id,
          slug: ss.slug,
          name: ss.name,
          depth: 2,
          children: [],
        })) ?? [],
      }));
      return [{ id: cat.id, slug: cat.slug, name: cat.name, depth: 0, children }];
    }
    for (const sub of cat.children ?? []) {
      if (sub.slug === targetSlug) {
        const children = sub.children?.map((ss) => ({
          id: ss.id,
          slug: ss.slug,
          name: ss.name,
          depth: 2,
          children: [],
        })) ?? [];
        const parentChildren = cat.children?.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          depth: 1,
          children: s.slug === targetSlug ? children : [],
        }));
        return [{ id: cat.id, slug: cat.slug, name: cat.name, depth: 0, children: parentChildren ?? [] }];
      }
      for (const subsub of sub.children ?? []) {
        if (subsub.slug === targetSlug) {
          const siblings = sub.children?.map((ss) => ({
            id: ss.id,
            slug: ss.slug,
            name: ss.name,
            depth: 2,
            children: [],
          }));
          const parentChildren = cat.children?.map((s) => ({
            id: s.id,
            slug: s.slug,
            name: s.name,
            depth: 1,
            children: s.slug === sub.slug ? (siblings ?? []) : [],
          }));
          return [{ id: cat.id, slug: cat.slug, name: cat.name, depth: 0, children: parentChildren ?? [] }];
        }
      }
    }
  }
  return [];
}

function TreeNodeItem({
  node,
  isActive,
  onSelect,
}: {
  node: TreeNode;
  isActive: boolean;
  onSelect: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(isActive || node.depth === 0);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <button
        onClick={() => {
          if (hasChildren) setExpanded((prev) => !prev);
          onSelect(node.slug);
        }}
        className={cn(
          'flex w-full items-center gap-1.5 py-2 px-2 text-left text-sm transition-colors rounded-[6px]',
          isActive
            ? 'bg-accent/10 text-accent-dark dark:text-accent font-semibold'
            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
        )}
        style={{ paddingLeft: `${8 + node.depth * 16}px` }}
      >
        {hasChildren ? (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform',
              !expanded && '-rotate-90',
            )}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="line-clamp-1">{node.name}</span>
      </button>
      {hasChildren && expanded && (
        <ul className="border-l border-neutral-200 dark:border-neutral-700 ml-[19px]">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              isActive={child.slug === undefined ? false : false}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoryHierarchySidebar({
  menuTree,
  currentSlug,
  onSelect,
}: CategoryHierarchySidebarProps) {
  const path = useMemo(() => buildFlatPath(menuTree, currentSlug), [menuTree, currentSlug]);

  if (menuTree.length === 0) return null;

  return (
    <aside className="w-[200px] shrink-0 lg:w-[220px]">
      <div className="sticky top-4 rounded-[8px] border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <h3 className="px-3 pt-3 pb-1 font-display text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Categories
        </h3>
        <nav className="py-1">
          <ul className="space-y-0.5 px-1">
            {menuTree.map((cat) => {
              const isActive = cat.slug === currentSlug;
              const isInPath = path.length > 0 && path[0].id === cat.id;

              if (isInPath && path.length > 0) {
                return (
                  <TreeNodeItem
                    key={cat.id}
                    node={path[0]}
                    isActive={isActive}
                    onSelect={onSelect}
                  />
                );
              }

              return (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelect(cat.slug)}
                    className={cn(
                      'flex w-full items-center gap-1.5 py-2 px-2 text-left text-sm transition-colors rounded-[6px]',
                      isActive
                        ? 'bg-accent/10 text-accent-dark dark:text-accent font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    )}
                  >
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span className="line-clamp-1">{cat.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
