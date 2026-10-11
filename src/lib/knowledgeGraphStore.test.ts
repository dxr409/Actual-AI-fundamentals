import { describe, it, expect, beforeEach } from 'vitest'
import { useKnowledgeGraphStore } from './knowledgeGraphStore'

describe('Knowledge Graph Engine & Store', () => {
  beforeEach(() => {
    useKnowledgeGraphStore.getState().resetGraph()
  })

  it('initializes with 14 curriculum nodes and default edges', () => {
    const { nodes, edges } = useKnowledgeGraphStore.getState()
    expect(nodes.length).toBe(14)
    expect(edges.length).toBeGreaterThanOrEqual(14)

    const math = nodes.find((n) => n.id === 'math_foundations')
    expect(math).toBeDefined()
    expect(math?.status).toBe('unlocked')

    const gd = nodes.find((n) => n.id === 'gradient_descent')
    expect(gd).toBeDefined()
    expect(gd?.status).toBe('locked')
  })

  it('scoring >= 70% masters the topic and unlocks downstream prerequisites', async () => {
    const store = useKnowledgeGraphStore.getState()

    // math_foundations -> gradient_descent & nlp_rnn
    const res = await store.recordQuizScore('math_foundations', 90)
    expect(res.success).toBe(true)

    const updated = useKnowledgeGraphStore.getState().nodes
    const mathNode = updated.find((n) => n.id === 'math_foundations')
    expect(mathNode?.status).toBe('mastered')
    expect(mathNode?.mastery_score).toBe(90)
    expect(mathNode?.brightness).toBeGreaterThanOrEqual(0.85)

    // Dependent nodes should now be unlocked
    const gdNode = updated.find((n) => n.id === 'gradient_descent')
    expect(gdNode?.status).toBe('unlocked')

    const rnnNode = updated.find((n) => n.id === 'nlp_rnn')
    expect(rnnNode?.status).toBe('unlocked')

    // But backpropagation should still be locked (depends on gradient_descent)
    const bpNode = updated.find((n) => n.id === 'backpropagation')
    expect(bpNode?.status).toBe('locked')
  })

  it('scoring < 70% sets needs_review and keeps downstream topics locked', async () => {
    const store = useKnowledgeGraphStore.getState()

    const res = await store.recordQuizScore('math_foundations', 50)
    expect(res.success).toBe(true)

    const updated = useKnowledgeGraphStore.getState().nodes
    const mathNode = updated.find((n) => n.id === 'math_foundations')
    expect(mathNode?.status).toBe('needs_review')
    expect(mathNode?.mastery_score).toBe(50)
    expect(mathNode?.brightness).toBeLessThanOrEqual(0.55)

    // Downstream node remains locked because math was not mastered
    const gdNode = updated.find((n) => n.id === 'gradient_descent')
    expect(gdNode?.status).toBe('locked')
  })

  it('chained mastery unlocks multiple levels across the branch', async () => {
    const store = useKnowledgeGraphStore.getState()

    // Level 1: Master math
    await store.recordQuizScore('math_foundations', 100)
    // Level 2: Master gradient descent
    await store.recordQuizScore('gradient_descent', 85)

    const updated = useKnowledgeGraphStore.getState().nodes
    const bpNode = updated.find((n) => n.id === 'backpropagation')
    expect(bpNode?.status).toBe('unlocked')
  })
})
