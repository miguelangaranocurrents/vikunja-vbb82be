import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

const LIST_NODE_TYPES = ['bulletList', 'orderedList']

/**
 * Plain text for copied editor content. ProseMirror's default drops list markers,
 * so a copied bullet list would paste back as unrelated lines.
 */
export function sliceToPlainText(slice: Slice): string {
	const blocks: string[] = []
	slice.content.forEach(child => {
		const text = nodeToText(child)
		if (text !== '') {
			blocks.push(text)
		}
	})
	return blocks.join('\n\n')
}

function nodeToText(node: ProseMirrorNode): string {
	if (node.isTextblock) {
		return node.textContent
	}

	if (node.isLeaf) {
		return ''
	}

	if (LIST_NODE_TYPES.includes(node.type.name)) {
		return listToText(node)
	}

	const parts: string[] = []
	node.forEach(child => {
		const text = nodeToText(child)
		if (text !== '') {
			parts.push(text)
		}
	})
	return parts.join('\n\n')
}

function listToText(list: ProseMirrorNode): string {
	const ordered = list.type.name === 'orderedList'
	const lines: string[] = []

	list.forEach((item, _offset, index) => {
		const marker = ordered ? `${index + 1}. ` : '- '
		const indent = ' '.repeat(marker.length)
		nodeToText(item).split('\n').forEach((line, lineIndex) => {
			lines.push((lineIndex === 0 ? marker : indent) + line)
		})
	})

	return lines.join('\n')
}
