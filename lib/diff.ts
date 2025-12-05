// Simple diff function to find character-level differences between two strings
// Returns ranges in the "after" string that differ from "before"
export function findDiffRanges(before: string, after: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  let i = 0 // before index
  let j = 0 // after index

  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      i++
      j++
    } else {
      // Found a difference - find where it ends
      const diffStart = j

      // Look ahead to find where strings sync up again
      // Try to find a matching substring
      let foundSync = false
      for (let lookAhead = 1; lookAhead < 20 && !foundSync; lookAhead++) {
        // Check if after[j+lookAhead:] starts matching before[i:]
        if (j + lookAhead < after.length && after[j + lookAhead] === before[i]) {
          // Verify it's a real sync by checking a few more chars
          let matches = true
          for (let k = 0; k < 3 && i + k < before.length && j + lookAhead + k < after.length; k++) {
            if (before[i + k] !== after[j + lookAhead + k]) {
              matches = false
              break
            }
          }
          if (matches) {
            ranges.push({ start: diffStart, end: j + lookAhead })
            j = j + lookAhead
            foundSync = true
          }
        }
        // Check if before[i+lookAhead:] starts matching after[j:]
        if (!foundSync && i + lookAhead < before.length && before[i + lookAhead] === after[j]) {
          let matches = true
          for (let k = 0; k < 3 && i + lookAhead + k < before.length && j + k < after.length; k++) {
            if (before[i + lookAhead + k] !== after[j + k]) {
              matches = false
              break
            }
          }
          if (matches) {
            // Deletion in before, no range to add in after
            i = i + lookAhead
            foundSync = true
          }
        }
      }

      if (!foundSync) {
        // Couldn't find sync point, just move both forward
        ranges.push({ start: diffStart, end: j + 1 })
        i++
        j++
      }
    }
  }

  // If after has extra content at the end
  if (j < after.length) {
    ranges.push({ start: j, end: after.length })
  }

  // Merge adjacent/overlapping ranges
  const merged: Array<{ start: number; end: number }> = []
  for (const range of ranges) {
    if (merged.length === 0) {
      merged.push(range)
    } else {
      const last = merged[merged.length - 1]
      if (range.start <= last.end + 1) {
        last.end = Math.max(last.end, range.end)
      } else {
        merged.push(range)
      }
    }
  }

  return merged
}
