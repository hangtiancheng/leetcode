import { PrismaClient } from '../src/generated/prisma/client.js'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

type SeedProblem = {
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  description: string
  examples: Array<{ input: string; output: string }>
  solutions: { typescript: string; javascript: string; go: string }
}

const problems: Array<SeedProblem> = [
  {
    title: '两数之和',
    difficulty: 'Easy',
    description:
      '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。\n\n你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。答案可以按任意顺序返回。',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    solutions: {
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const j = seen.get(target - nums[i])
    if (j !== undefined) return [j, i]
    seen.set(nums[i], i)
  }
  return []
}
`,
      javascript: `function twoSum(nums, target) {
  const seen = new Map()
  for (let i = 0; i < nums.length; i++) {
    const j = seen.get(target - nums[i])
    if (j !== undefined) return [j, i]
    seen.set(nums[i], i)
  }
  return []
}
`,
      go: `func twoSum(nums []int, target int) []int {
	seen := make(map[int]int, len(nums))
	for i, v := range nums {
		if j, ok := seen[target-v]; ok {
			return []int{j, i}
		}
		seen[v] = i
	}
	return nil
}
`,
    },
  },
  {
    title: '有效的括号',
    difficulty: 'Easy',
    description:
      "给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s，判断字符串是否有效。\n\n有效字符串需满足：左括号必须用相同类型的右括号闭合；左括号必须以正确的顺序闭合；每个右括号都有一个对应的相同类型的左括号。",
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    solutions: {
      typescript: `function isValid(s: string): boolean {
  const pair: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
  const stack: string[] = []
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch)
    } else if (stack.pop() !== pair[ch]) {
      return false
    }
  }
  return stack.length === 0
}
`,
      javascript: `function isValid(s) {
  const pair = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch)
    } else if (stack.pop() !== pair[ch]) {
      return false
    }
  }
  return stack.length === 0
}
`,
      go: `func isValid(s string) bool {
	pair := map[byte]byte{')': '(', ']': '[', '}': '{'}
	stack := []byte{}
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c == '(' || c == '[' || c == '{' {
			stack = append(stack, c)
			continue
		}
		if len(stack) == 0 || stack[len(stack)-1] != pair[c] {
			return false
		}
		stack = stack[:len(stack)-1]
	}
	return len(stack) == 0
}
`,
    },
  },
  {
    title: '无重复字符的最长子串',
    difficulty: 'Medium',
    description:
      '给定一个字符串 s，请你找出其中不含有重复字符的最长子串的长度。\n\n注意：子串要求是连续的，与子序列不同。',
    examples: [
      { input: 's = "abcabcbb"', output: '3' },
      { input: 's = "bbbbb"', output: '1' },
      { input: 's = "pwwkew"', output: '3' },
    ],
    solutions: {
      typescript: `function lengthOfLongestSubstring(s: string): number {
  const last = new Map<string, number>()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    const prev = last.get(s[right])
    if (prev !== undefined && prev >= left) left = prev + 1
    last.set(s[right], right)
    best = Math.max(best, right - left + 1)
  }
  return best
}
`,
      javascript: `function lengthOfLongestSubstring(s) {
  const last = new Map()
  let left = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    const prev = last.get(s[right])
    if (prev !== undefined && prev >= left) left = prev + 1
    last.set(s[right], right)
    best = Math.max(best, right - left + 1)
  }
  return best
}
`,
      go: `func lengthOfLongestSubstring(s string) int {
	last := make(map[byte]int)
	left, best := 0, 0
	for right := 0; right < len(s); right++ {
		if prev, ok := last[s[right]]; ok && prev >= left {
			left = prev + 1
		}
		last[s[right]] = right
		if right-left+1 > best {
			best = right - left + 1
		}
	}
	return best
}
`,
    },
  },
  {
    title: 'LRU 缓存',
    difficulty: 'Medium',
    description:
      '请你设计并实现一个满足 LRU（最近最少使用）缓存约束的数据结构。\n\n实现 LRUCache 类：LRUCache(int capacity) 以正整数作为容量初始化缓存；int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1；void put(int key, int value) 如果关键字已存在则变更其值，不存在则插入；当缓存容量超出上限时，逐出最久未使用的关键字。\n\nget 和 put 必须以 O(1) 的平均时间复杂度运行。',
    examples: [
      {
        input:
          '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]',
        output: '[null,null,null,1,null,-1,null,-1,3,4]',
      },
    ],
    solutions: {
      typescript: `class LRUCache {
  private cache = new Map<number, number>()

  constructor(private capacity: number) {}

  get(key: number): number {
    const value = this.cache.get(key)
    if (value === undefined) return -1
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) this.cache.delete(key)
    this.cache.set(key, value)
    if (this.cache.size > this.capacity) {
      const oldest = this.cache.keys().next().value
      if (oldest !== undefined) this.cache.delete(oldest)
    }
  }
}
`,
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return -1
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key)
    this.cache.set(key, value)
    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value)
    }
  }
}
`,
      go: `import "container/list"

type entry struct {
	key, value int
}

type LRUCache struct {
	capacity int
	items    map[int]*list.Element
	order    *list.List
}

func Constructor(capacity int) LRUCache {
	return LRUCache{
		capacity: capacity,
		items:    make(map[int]*list.Element, capacity),
		order:    list.New(),
	}
}

func (c *LRUCache) Get(key int) int {
	el, ok := c.items[key]
	if !ok {
		return -1
	}
	c.order.MoveToFront(el)
	return el.Value.(*entry).value
}

func (c *LRUCache) Put(key int, value int) {
	if el, ok := c.items[key]; ok {
		el.Value.(*entry).value = value
		c.order.MoveToFront(el)
		return
	}
	if c.order.Len() == c.capacity {
		oldest := c.order.Back()
		c.order.Remove(oldest)
		delete(c.items, oldest.Value.(*entry).key)
	}
	c.items[key] = c.order.PushFront(&entry{key, value})
}
`,
    },
  },
  {
    title: '接雨水',
    difficulty: 'Hard',
    description:
      '给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。\n\n双指针解法：始终从较矮的一侧向内收缩，用该侧的历史最大高度决定当前柱子上方的积水量。',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' },
    ],
    solutions: {
      typescript: `function trap(height: number[]): number {
  let left = 0
  let right = height.length - 1
  let leftMax = 0
  let rightMax = 0
  let water = 0
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left])
      water += leftMax - height[left]
      left++
    } else {
      rightMax = Math.max(rightMax, height[right])
      water += rightMax - height[right]
      right--
    }
  }
  return water
}
`,
      javascript: `function trap(height) {
  let left = 0
  let right = height.length - 1
  let leftMax = 0
  let rightMax = 0
  let water = 0
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left])
      water += leftMax - height[left]
      left++
    } else {
      rightMax = Math.max(rightMax, height[right])
      water += rightMax - height[right]
      right--
    }
  }
  return water
}
`,
      go: `func trap(height []int) int {
	left, right := 0, len(height)-1
	leftMax, rightMax, water := 0, 0, 0
	for left < right {
		if height[left] < height[right] {
			if height[left] > leftMax {
				leftMax = height[left]
			}
			water += leftMax - height[left]
			left++
		} else {
			if height[right] > rightMax {
				rightMax = height[right]
			}
			water += rightMax - height[right]
			right--
		}
	}
	return water
}
`,
    },
  },
]

const twoSumBruteForceV1 = `function twoSum(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j]
    }
  }
  return []
}
`

async function main() {
  console.log('Seeding database...')

  await prisma.problem.deleteMany()

  for (const p of problems) {
    await prisma.problem.create({
      data: {
        title: p.title,
        difficulty: p.difficulty,
        description: p.description,
        examples: {
          create: p.examples.map((e, i) => ({ ...e, order: i })),
        },
        solutions: {
          create: (['typescript', 'javascript', 'go'] as const).map(
            (language) => ({
              language,
              code: p.solutions[language],
            }),
          ),
        },
      },
    })
  }

  // 给「两数之和」的 TS 答案预置一条历史版本，便于演示回滚
  const twoSumTs = await prisma.solution.findFirst({
    where: { language: 'typescript', problem: { title: '两数之和' } },
  })
  if (twoSumTs) {
    await prisma.solution.update({
      where: { id: twoSumTs.id },
      data: {
        version: 2,
        revisions: {
          create: { code: twoSumBruteForceV1, version: 1 },
        },
      },
    })
  }

  console.log(`Seeded ${problems.length} problems (TS/JS/Go solutions each)`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
