#!/usr/bin/env python3
"""
Obsidian Vault 管理工具
因为 Obsidian vault 就是普通的 Markdown 文件夹
可以直接用文件操作来管理
"""

import os
import json
import subprocess
from pathlib import Path
from datetime import datetime

# 默认 Vault 路径
DEFAULT_VAULT_PATH = os.path.expanduser("~/Documents/obsidian")

def find_obsidian_vaults():
    """查找系统的 Obsidian vaults"""
    obsidian_dir = os.path.expanduser("~/Library/Application Support/obsidian")
    config_file = os.path.join(obsidian_dir, "obsidian.json")
    
    vaults = []
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            data = json.load(f)
            for vault in data.get('vaults', {}).values():
                vaults.append({
                    'name': vault.get('name'),
                    'path': vault.get('path')
                })
    return vaults

def set_vault(vault_path):
    """设置默认 vault"""
    config_dir = Path.home() / ".config" / "obsidian-cli"
    config_dir.mkdir(parents=True, exist_ok=True)
    with open(config_dir / "vault.txt", 'w') as f:
        f.write(vault_path)
    return vault_path

def get_vault():
    """获取默认 vault"""
    config_file = Path.home() / ".config" / "obsidian-cli" / "vault.txt"
    if config_file.exists():
        with open(config_file, 'r') as f:
            return f.read().strip()
    return DEFAULT_VAULT_PATH

def list_notes(vault_path=None, folder=""):
    """列出 vault 中的笔记"""
    vault = vault_path or get_vault()
    vault_path = Path(vault) / folder
    
    if not vault_path.exists():
        return []
    
    notes = []
    for f in vault_path.rglob("*.md"):
        rel_path = f.relative_to(vault_path)
        notes.append({
            'name': f.stem,
            'path': str(rel_path),
            'modified': datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M")
        })
    return notes

def search_notes(query, vault_path=None):
    """搜索笔记内容"""
    vault = vault_path or get_vault()
    results = []
    
    vault_path = Path(vault)
    for f in vault_path.rglob("*.md"):
        try:
            with open(f, 'r', encoding='utf-8') as file:
                content = file.read()
                if query.lower() in content.lower():
                    rel_path = f.relative_to(vault_path)
                    # 找到匹配的行
                    lines = content.split('\n')
                    matches = [l.strip() for l in lines if query.lower() in l.lower()][:3]
                    results.append({
                        'name': f.stem,
                        'path': str(rel_path),
                        'matches': matches
                    })
        except:
            pass
    return results

def create_note(title, content="", folder="", vault_path=None):
    """创建新笔记"""
    vault = vault_path or get_vault()
    note_path = Path(vault) / folder / f"{title}.md"
    note_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(note_path, 'w', encoding='utf-8') as f:
        f.write(f"# {title}\n\n")
        if content:
            f.write(content)
        f.write(f"\n\n---\n创建时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    return str(note_path)

def read_note(title_or_path, vault_path=None):
    """读取笔记内容"""
    vault = vault_path or get_vault()
    note_path = Path(vault) / title_or_path
    
    if not note_path.exists():
        note_path = Path(vault) / f"{title_or_path}.md"
    
    if note_path.exists():
        with open(note_path, 'r', encoding='utf-8') as f:
            return f.read()
    return None

def update_note(title_or_path, new_content, vault_path=None, append=False):
    """更新笔记内容"""
    vault = vault_path or get_vault()
    note_path = Path(vault) / title_or_path
    
    if not note_path.exists():
        note_path = Path(vault) / f"{title_or_path}.md"
    
    if append:
        with open(note_path, 'a', encoding='utf-8') as f:
            f.write(f"\n\n{new_content}")
    else:
        with open(note_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
    
    return str(note_path)

def delete_note(title_or_path, vault_path=None):
    """删除笔记"""
    vault = vault_path or get_vault()
    note_path = Path(vault) / title_or_path
    
    if not note_path.exists():
        note_path = Path(vault) / f"{title_or_path}.md"
    
    if note_path.exists():
        note_path.unlink()
        return True
    return False

def list_folders(vault_path=None):
    """列出 vault 中的文件夹"""
    vault = vault_path or get_vault()
    vault_path = Path(vault)
    
    folders = set()
    for f in vault_path.rglob("*"):
        if f.is_dir() and not f.name.startswith('.'):
            rel_path = f.relative_to(vault_path)
            folders.add(str(rel_path))
    
    return sorted(folders)

# CLI 接口
def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Obsidian Vault 管理工具")
        print("用法: python3 obsidian.py <命令> [参数]")
        print("\n命令:")
        print("  vaults              - 列出所有 vault")
        print("  set-vault <路径>    - 设置默认 vault")
        print("  list                - 列出所有笔记")
        print("  folders             - 列出所有文件夹")
        print("  search <关键词>     - 搜索笔记")
        print("  create <标题> [内容] - 创建笔记")
        print("  read <标题>         - 读取笔记")
        print("  update <标题> <内容> - 更新笔记")
        print("  append <标题> <内容> - 追加内容")
        print("  delete <标题>       - 删除笔记")
        return
    
    cmd = sys.argv[1]
    
    if cmd == "vaults":
        vaults = find_obsidian_vaults()
        for v in vaults:
            print(f"{v['name']}: {v['path']}")
    
    elif cmd == "set-vault" and len(sys.argv) > 2:
        path = sys.argv[2]
        set_vault(path)
        print(f"✅ 已设置默认 vault: {path}")
    
    elif cmd == "list":
        for note in list_notes():
            print(f"{note['modified']} - {note['name']}")
    
    elif cmd == "folders":
        for folder in list_folders():
            print(folder)
    
    elif cmd == "search" and len(sys.argv) > 2:
        query = ' '.join(sys.argv[2:])
        results = search_notes(query)
        if results:
            for r in results[:10]:
                print(f"\n📄 {r['name']}")
                print(f"   路径: {r['path']}")
                for m in r['matches']:
                    print(f"   → {m[:80]}")
        else:
            print("未找到相关内容")
    
    elif cmd == "create" and len(sys.argv) > 2:
        title = sys.argv[2]
        content = ' '.join(sys.argv[3:]) if len(sys.argv) > 3 else ""
        path = create_note(title, content)
        print(f"✅ 已创建: {path}")
    
    elif cmd == "read" and len(sys.argv) > 2:
        title = sys.argv[2]
        content = read_note(title)
        if content:
            print(content)
        else:
            print("笔记不存在")
    
    elif cmd == "update" and len(sys.argv) > 3:
        title = sys.argv[2]
        content = ' '.join(sys.argv[3:])
        path = update_note(title, content)
        print(f"✅ 已更新: {path}")
    
    elif cmd == "append" and len(sys.argv) > 3:
        title = sys.argv[2]
        content = ' '.join(sys.argv[3:])
        path = update_note(title, content, append=True)
        print(f"✅ 已追加: {path}")
    
    elif cmd == "delete" and len(sys.argv) > 2:
        title = sys.argv[2]
        if delete_note(title):
            print(f"✅ 已删除: {title}")
        else:
            print("笔记不存在")

if __name__ == "__main__":
    main()
