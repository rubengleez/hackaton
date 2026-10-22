import type { Outfit, Product } from './types'
import { outfitTotal, productsForOutfit } from './utils'

export interface BudgetSwap {
  original: Product
  chosen: Product
  changed: boolean
}

export interface BudgetLook {
  swaps: BudgetSwap[]
  originalTotal: number
  total: number
  savings: number
  feasible: boolean
  overBy: number
  changedCount: number
}

const styleScore = (candidate: Product, original: Product, outfit: Outfit) => {
  let score = 0
  if (candidate.style === outfit.style) score += 10
  if (candidate.style === original.style) score += 3
  if (candidate.color === original.color) score += 2
  if (candidate.id === original.id) score += 4
  if (candidate.tier === 'premium') score += 1
  return score
}

export function cheapestTotal(outfit: Outfit, products: Product[]) {
  const originals = productsForOutfit(outfit, products)
  const used = new Set<string>()
  return originals.reduce((sum, original) => {
    const options = products
      .filter((product) => product.category === original.category)
      .sort((a, b) => a.price - b.price)
    const chosen = options.find((option) => !used.has(option.id)) ?? original
    used.add(chosen.id)
    return sum + chosen.price
  }, 0)
}

export function alternativesForItem(
  product: Product,
  products: Product[],
  maxPrice: number,
) {
  return products
    .filter(
      (candidate) =>
        candidate.category === product.category &&
        candidate.price <= maxPrice &&
        candidate.price < product.price,
    )
    .sort(
      (a, b) =>
        Number(b.style === product.style) - Number(a.style === product.style) ||
        b.price - a.price,
    )
    .slice(0, 6)
}

export function buildBudgetLook(
  outfit: Outfit,
  products: Product[],
  budget: number,
): BudgetLook {
  const originals = productsForOutfit(outfit, products)
  const originalTotal = outfitTotal(outfit, products)

  const candidateLists = originals.map((original) => {
    const sameCategory = products.filter(
      (product) => product.category === original.category,
    )
    const ranked = [...sameCategory]
      .sort(
        (a, b) =>
          styleScore(b, original, outfit) - styleScore(a, original, outfit) ||
          a.price - b.price,
      )
      .slice(0, 7)
    const cheapest = [...sameCategory]
      .sort((a, b) => a.price - b.price)
      .slice(0, 3)
    const unique = new Map<string, Product>()
    unique.set(original.id, original)
    ranked.forEach((product) => unique.set(product.id, product))
    cheapest.forEach((product) => unique.set(product.id, product))
    return [...unique.values()]
  })

  let best:
    | { chosen: Product[]; score: number; total: number; kept: number }
    | undefined

  const walk = (index: number, chosen: Product[], total: number, score: number, kept: number) => {
    if (total > budget) return
    if (index === originals.length) {
      if (
        !best ||
        score > best.score ||
        (score === best.score && total > best.total) ||
        (score === best.score && total === best.total && kept > best.kept)
      ) {
        best = { chosen: [...chosen], score, total, kept }
      }
      return
    }

    const original = originals[index]
    for (const candidate of candidateLists[index]) {
      if (chosen.some((product) => product.id === candidate.id)) continue
      walk(
        index + 1,
        [...chosen, candidate],
        total + candidate.price,
        score + styleScore(candidate, original, outfit),
        kept + Number(candidate.id === original.id),
      )
    }
  }

  walk(0, [], 0, 0, 0)

  if (best) {
    const swaps = originals.map((original, index) => {
      const chosen = best!.chosen[index]
      return { original, chosen, changed: chosen.id !== original.id }
    })
    return {
      swaps,
      originalTotal,
      total: best.total,
      savings: Math.max(0, originalTotal - best.total),
      feasible: true,
      overBy: 0,
      changedCount: swaps.filter((swap) => swap.changed).length,
    }
  }

  const used = new Set<string>()
  const cheapest = originals.map((original) => {
    const options = products
      .filter((product) => product.category === original.category)
      .sort((a, b) => a.price - b.price)
    const chosen = options.find((option) => !used.has(option.id)) ?? original
    used.add(chosen.id)
    return chosen
  })
  const total = cheapest.reduce((sum, product) => sum + product.price, 0)

  return {
    swaps: originals.map((original, index) => ({
      original,
      chosen: cheapest[index],
      changed: cheapest[index].id !== original.id,
    })),
    originalTotal,
    total,
    savings: Math.max(0, originalTotal - total),
    feasible: false,
    overBy: Math.max(0, total - budget),
    changedCount: cheapest.filter((product, index) => product.id !== originals[index].id)
      .length,
  }
}
