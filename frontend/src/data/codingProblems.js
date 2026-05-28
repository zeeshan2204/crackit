// Placement-level coding problem bank — 12 problems
// 2 picked randomly each attempt via pickRandom(CODING_PROBLEM_BANK, 2)

export const CODING_PROBLEM_BANK = [

  // ─── P1: Second Largest Element (medium) ────────────────────
  {
    id: 'P1', title: 'Second Largest Element', difficulty: 'medium', timeHint: '~20 min',
    description: `Given an array of N **distinct** integers, find the **second largest** element.

**Input Format**
Line 1: integer N
Line 2: N space-separated integers

**Output**
Print the second largest element.

**Constraints**
2 <= N <= 10⁵ | All elements are distinct`,
    examples: [
      { input: '5\n1 2 3 4 5', output: '4', note: 'Largest=5, second=4' },
      { input: '4\n10 5 7 3',  output: '7', note: 'Largest=10, second=7' },
    ],
    testCases: [
      { input: '5\n1 2 3 4 5\n',         expected: '4',   label: 'Test 1' },
      { input: '4\n10 5 7 3\n',          expected: '7',   label: 'Test 2' },
      { input: '3\n100 200 150\n',       expected: '150', label: 'Test 3' },
      { input: '6\n-3 -1 -4 -6 -5 -9\n',expected: '-3',  label: 'Test 4' },
    ],
    starterCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))

# Find and print the second largest element
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        // Find and print the second largest element
    }
}`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int arr[100000];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    // Find and print the second largest element
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    // Find and print the second largest element
    return 0;
}`,
    },
  },

  // ─── P2: Check Palindrome (easy) ────────────────────────────
  {
    id: 'P2', title: 'Check Palindrome', difficulty: 'easy', timeHint: '~10 min',
    description: `Given a string, check if it is a **palindrome** (reads the same forwards and backwards).

**Input Format**
A single string (no spaces)

**Output**
Print \`YES\` if palindrome, else \`NO\`.

**Constraints**
1 <= |S| <= 10⁵ | String contains only alphanumeric characters`,
    examples: [
      { input: 'madam', output: 'YES', note: 'Reads same forwards and backwards' },
      { input: 'hello', output: 'NO',  note: 'Reverse is "olleh"' },
    ],
    testCases: [
      { input: 'madam\n',   expected: 'YES', label: 'Test 1' },
      { input: 'hello\n',   expected: 'NO',  label: 'Test 2' },
      { input: 'racecar\n', expected: 'YES', label: 'Test 3' },
      { input: '12321\n',   expected: 'YES', label: 'Test 4' },
    ],
    starterCode: {
      python: `s = input()

# Check if s is a palindrome
# Print YES or NO
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        // Check if s is a palindrome
        // Print YES or NO
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
int main() {
    char s[100001];
    scanf("%s", s);
    // Check if s is a palindrome
    // Print YES or NO
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s; cin >> s;
    // Check if s is a palindrome
    // Print YES or NO
    return 0;
}`,
    },
  },

  // ─── P3: Find Missing Number (easy) ─────────────────────────
  {
    id: 'P3', title: 'Find the Missing Number', difficulty: 'easy', timeHint: '~10 min',
    description: `Given an array of (N-1) distinct integers taken from 1 to N, find the **missing number**.

**Input Format**
Line 1: integer N
Line 2: (N-1) space-separated integers

**Output**
Print the missing number.

**Constraints**
2 <= N <= 10⁵`,
    examples: [
      { input: '5\n1 2 4 5', output: '3', note: '3 is missing from 1..5' },
      { input: '4\n1 3 4',   output: '2', note: '2 is missing from 1..4' },
    ],
    testCases: [
      { input: '5\n1 2 4 5\n',    expected: '3', label: 'Test 1' },
      { input: '4\n1 3 4\n',      expected: '2', label: 'Test 2' },
      { input: '6\n2 3 4 5 6\n',  expected: '1', label: 'Test 3' },
      { input: '7\n1 2 3 4 5 6\n',expected: '7', label: 'Test 4' },
    ],
    starterCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))

# Find the missing number from 1 to N
# Hint: use the formula sum(1..N) = N*(N+1)/2
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n - 1];
        for (int i = 0; i < n - 1; i++) arr[i] = sc.nextInt();
        // Find the missing number from 1 to N
    }
}`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int arr[100000];
    for (int i = 0; i < n - 1; i++) scanf("%d", &arr[i]);
    // Find the missing number from 1 to N
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> arr(n - 1);
    for (int i = 0; i < n - 1; i++) cin >> arr[i];
    // Find the missing number from 1 to N
    return 0;
}`,
    },
  },

  // ─── P4: Maximum Subarray Sum — Kadane's (medium) ───────────
  {
    id: 'P4', title: 'Maximum Subarray Sum', difficulty: 'medium', timeHint: '~25 min',
    description: `Given an array of N integers (may include negatives), find the **maximum sum of any contiguous subarray**.

**Input Format**
Line 1: integer N
Line 2: N space-separated integers

**Output**
Print the maximum subarray sum.

**Constraints**
1 <= N <= 10⁵ | -10⁴ <= arr[i] <= 10⁴`,
    examples: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', note: 'Subarray [4,-1,2,1] = 6' },
      { input: '5\n1 2 3 4 5',              output: '15', note: 'Entire array sums to 15' },
    ],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4\n', expected: '6',  label: 'Test 1' },
      { input: '5\n1 2 3 4 5\n',              expected: '15', label: 'Test 2' },
      { input: '4\n-1 -2 -3 -4\n',            expected: '-1', label: 'Test 3' },
      { input: '6\n2 -1 2 3 4 -5\n',          expected: '10', label: 'Test 4' },
    ],
    starterCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))

# Find maximum sum contiguous subarray
# Hint: Kadane's Algorithm — track current_sum and max_sum
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        // Kadane's algorithm: track maxSum and currSum
    }
}`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int arr[100000];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    // Kadane's algorithm
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    // Kadane's algorithm
    return 0;
}`,
    },
  },

  // ─── P5: Reverse Words in a String (easy) ───────────────────
  {
    id: 'P5', title: 'Reverse Words in a String', difficulty: 'easy', timeHint: '~10 min',
    description: `Given a sentence, print the words in **reverse order**.

**Input Format**
A single line of space-separated words.

**Output**
Words printed in reverse order, separated by a single space.

**Constraints**
1 <= words <= 100 | Each word has 1..20 lowercase/uppercase letters`,
    examples: [
      { input: 'Hello World',       output: 'World Hello',           note: 'Two words reversed' },
      { input: 'Good Morning Everyone', output: 'Everyone Morning Good', note: 'Three words reversed' },
    ],
    testCases: [
      { input: 'Hello World\n',          expected: 'World Hello',           label: 'Test 1' },
      { input: 'Good Morning Everyone\n',expected: 'Everyone Morning Good', label: 'Test 2' },
      { input: 'Python\n',               expected: 'Python',                label: 'Test 3' },
      { input: 'I love coding\n',        expected: 'coding love I',         label: 'Test 4' },
    ],
    starterCode: {
      python: `line = input()

# Reverse the order of words and print
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        // Reverse the order of words and print
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
int main() {
    char line[2001];
    fgets(line, sizeof(line), stdin);
    // Reverse the order of words and print
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string line;
    getline(cin, line);
    // Reverse the order of words and print
    return 0;
}`,
    },
  },

  // ─── P6: Valid Parentheses (medium) ─────────────────────────
  {
    id: 'P6', title: 'Valid Parentheses', difficulty: 'medium', timeHint: '~20 min',
    description: `Given a string containing only \`(\` and \`)\`, check if it is **valid**.

A string is valid if:
- Every opening bracket has a matching closing bracket.
- Brackets close in the correct order.

**Input Format**
A single string of parentheses.

**Output**
Print \`YES\` if valid, else \`NO\`.

**Constraints**
1 <= |S| <= 10⁴`,
    examples: [
      { input: '(())', output: 'YES', note: 'Properly nested' },
      { input: '(()',  output: 'NO',  note: 'Unmatched opening bracket' },
    ],
    testCases: [
      { input: '(())\n', expected: 'YES', label: 'Test 1' },
      { input: '()()\n', expected: 'YES', label: 'Test 2' },
      { input: '(()\n',  expected: 'NO',  label: 'Test 3' },
      { input: ')(\n',   expected: 'NO',  label: 'Test 4' },
    ],
    starterCode: {
      python: `s = input()

# Use a stack to check balanced parentheses
# Print YES or NO
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        // Use stack to validate parentheses
        // Print YES or NO
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
int main() {
    char s[10001];
    scanf("%s", s);
    // Use a stack (array) to validate
    // Print YES or NO
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s; cin >> s;
    // Use stack to validate parentheses
    // Print YES or NO
    return 0;
}`,
    },
  },

  // ─── P7: Fibonacci Series (easy) ────────────────────────────
  {
    id: 'P7', title: 'Fibonacci Series', difficulty: 'easy', timeHint: '~10 min',
    description: `Print the **first N Fibonacci numbers** starting from 0.

The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, ...

**Input Format**
A single integer N.

**Output**
First N Fibonacci numbers separated by spaces.

**Constraints**
1 <= N <= 50`,
    examples: [
      { input: '5', output: '0 1 1 2 3', note: 'First 5 Fibonacci numbers' },
      { input: '1', output: '0',          note: 'Only the first number' },
    ],
    testCases: [
      { input: '5\n',  expected: '0 1 1 2 3',             label: 'Test 1' },
      { input: '1\n',  expected: '0',                      label: 'Test 2' },
      { input: '7\n',  expected: '0 1 1 2 3 5 8',         label: 'Test 3' },
      { input: '10\n', expected: '0 1 1 2 3 5 8 13 21 34', label: 'Test 4' },
    ],
    starterCode: {
      python: `n = int(input())

# Print first n Fibonacci numbers (0-indexed: 0,1,1,2,3,...)
# Output space-separated on one line
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Generate and print first n Fibonacci numbers
        // Space-separated, no trailing space
    }
}`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    // Print first n Fibonacci numbers space-separated
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    // Print first n Fibonacci numbers space-separated
    return 0;
}`,
    },
  },

  // ─── P8: Matrix Diagonal Sum (medium) ───────────────────────
  {
    id: 'P8', title: 'Matrix Diagonal Sum', difficulty: 'medium', timeHint: '~20 min',
    description: `Given an N×N matrix, find the sum of elements on **both diagonals**.
For odd N, the center element is counted only once.

**Input Format**
Line 1: integer N
Next N lines: N space-separated integers each

**Output**
Print the diagonal sum.

**Constraints**
1 <= N <= 100 | 0 <= matrix[i][j] <= 1000`,
    examples: [
      { input: '3\n1 2 3\n4 5 6\n7 8 9', output: '25', note: 'Main: 1+5+9=15, Anti: 3+5+7=15, center 5 once → 25' },
      { input: '2\n1 2\n3 4',             output: '10', note: '1+4=5, 2+3=5, total 10' },
    ],
    testCases: [
      { input: '3\n1 2 3\n4 5 6\n7 8 9\n',       expected: '25', label: 'Test 1' },
      { input: '2\n1 2\n3 4\n',                   expected: '10', label: 'Test 2' },
      { input: '1\n5\n',                           expected: '5',  label: 'Test 3' },
      { input: '3\n1 0 0\n0 1 0\n0 0 1\n',        expected: '3',  label: 'Test 4' },
    ],
    starterCode: {
      python: `n = int(input())
matrix = []
for _ in range(n):
    row = list(map(int, input().split()))
    matrix.append(row)

# Sum both diagonals, subtract center once if n is odd
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] m = new int[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) m[i][j] = sc.nextInt();
        // Sum both diagonals (subtract center for odd n)
    }
}`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int m[100][100];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) scanf("%d", &m[i][j]);
    // Sum both diagonals (subtract center for odd n)
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<vector<int>> m(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> m[i][j];
    // Sum both diagonals (subtract center for odd n)
    return 0;
}`,
    },
  },

  // ─── P9: Binary Search (easy) ───────────────────────────────
  {
    id: 'P9', title: 'Binary Search', difficulty: 'easy', timeHint: '~15 min',
    description: `Given a **sorted** array and a target, find the **1-based index** of the target using binary search. Print \`-1\` if not found.

**Input Format**
Line 1: integer N
Line 2: N sorted integers
Line 3: target integer

**Output**
Print the 1-based index, or -1.

**Constraints**
1 <= N <= 10⁵ | All elements are distinct`,
    examples: [
      { input: '5\n1 3 5 7 9\n7', output: '4', note: '7 is at index 4 (1-based)' },
      { input: '5\n1 3 5 7 9\n6', output: '-1', note: '6 not in array' },
    ],
    testCases: [
      { input: '5\n1 3 5 7 9\n7\n', expected: '4',  label: 'Test 1' },
      { input: '5\n1 3 5 7 9\n1\n', expected: '1',  label: 'Test 2' },
      { input: '5\n1 3 5 7 9\n6\n', expected: '-1', label: 'Test 3' },
      { input: '4\n2 4 6 8\n8\n',   expected: '4',  label: 'Test 4' },
    ],
    starterCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
target = int(input())

# Implement binary search
# Print 1-based index or -1 if not found
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int target = sc.nextInt();
        // Binary search — print 1-based index or -1
    }
}`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int arr[100000];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    int target;
    scanf("%d", &target);
    // Binary search — print 1-based index or -1
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    int target; cin >> target;
    // Binary search — print 1-based index or -1
    return 0;
}`,
    },
  },

  // ─── P10: Count Pairs with Given Sum (medium) ───────────────
  {
    id: 'P10', title: 'Count Pairs with Given Sum', difficulty: 'medium', timeHint: '~20 min',
    description: `Given an array of N integers and a target, count all **pairs (i, j)** where i < j and arr[i] + arr[j] = target.

**Input Format**
Line 1: integer N
Line 2: N integers
Line 3: target sum

**Output**
Print the count of valid pairs.

**Constraints**
1 <= N <= 10³ | -10⁴ <= arr[i] <= 10⁴`,
    examples: [
      { input: '5\n1 2 3 4 5\n6', output: '2', note: 'Pairs: (1,5) and (2,4)' },
      { input: '6\n1 2 3 4 5 6\n7', output: '3', note: 'Pairs: (1,6),(2,5),(3,4)' },
    ],
    testCases: [
      { input: '5\n1 2 3 4 5\n6\n',   expected: '2', label: 'Test 1' },
      { input: '6\n1 2 3 4 5 6\n7\n', expected: '3', label: 'Test 2' },
      { input: '4\n1 2 3 4\n10\n',    expected: '0', label: 'Test 3' },
      { input: '3\n1 3 3\n6\n',       expected: '1', label: 'Test 4' },
    ],
    starterCode: {
      python: `n = int(input())
arr = list(map(int, input().split()))
target = int(input())

# Count pairs (i < j) where arr[i] + arr[j] == target
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int target = sc.nextInt();
        // Count pairs (i < j) summing to target
    }
}`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int arr[1000];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    int target;
    scanf("%d", &target);
    // Count pairs (i < j) summing to target
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    int target; cin >> target;
    // Count pairs (i < j) summing to target
    return 0;
}`,
    },
  },

  // ─── P11: Pascal's Triangle Row (easy) ──────────────────────
  {
    id: 'P11', title: "Pascal's Triangle Row", difficulty: 'easy', timeHint: '~15 min',
    description: `Given N, print the **Nth row** of Pascal's Triangle (1-indexed).

Row 1: 1
Row 2: 1 1
Row 3: 1 2 1
Row 4: 1 3 3 1

**Input Format**
A single integer N.

**Output**
Space-separated numbers of the Nth row.

**Constraints**
1 <= N <= 30`,
    examples: [
      { input: '4', output: '1 3 3 1', note: '4th row of Pascal\'s triangle' },
      { input: '5', output: '1 4 6 4 1', note: '5th row' },
    ],
    testCases: [
      { input: '1\n', expected: '1',         label: 'Test 1' },
      { input: '4\n', expected: '1 3 3 1',   label: 'Test 2' },
      { input: '5\n', expected: '1 4 6 4 1', label: 'Test 3' },
      { input: '6\n', expected: '1 5 10 10 5 1', label: 'Test 4' },
    ],
    starterCode: {
      python: `n = int(input())

# Build the nth row of Pascal's triangle
# Hint: each element = prev * (n-i) // i
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // Build nth row of Pascal's triangle and print space-separated
    }
}`,
      c: `#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    // Build nth row of Pascal's triangle
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    // Build nth row of Pascal's triangle and print space-separated
    return 0;
}`,
    },
  },

  // ─── P12: Longest Common Subsequence (hard) ─────────────────
  {
    id: 'P12', title: 'Longest Common Subsequence', difficulty: 'hard', timeHint: '~40 min',
    description: `Given two strings, find the length of their **Longest Common Subsequence (LCS)**.

A subsequence is formed by deleting some characters (possibly zero) without changing relative order.

**Input Format**
Line 1: string S1
Line 2: string S2

**Output**
Print the length of LCS.

**Constraints**
1 <= |S1|, |S2| <= 1000 | Lowercase English letters only`,
    examples: [
      { input: 'abcde\nace', output: '3', note: 'LCS = "ace"' },
      { input: 'abc\nabc',   output: '3', note: 'LCS = "abc"' },
    ],
    testCases: [
      { input: 'abcde\nace\n',      expected: '3', label: 'Test 1' },
      { input: 'abc\nabc\n',        expected: '3', label: 'Test 2' },
      { input: 'abc\ndef\n',        expected: '0', label: 'Test 3' },
      { input: 'aggtab\ngxtxayb\n', expected: '4', label: 'Test 4' },
    ],
    starterCode: {
      python: `s1 = input()
s2 = input()

# Use DP: dp[i][j] = LCS length of s1[:i] and s2[:j]
`,
      java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s1 = sc.next();
        String s2 = sc.next();
        // DP solution for LCS
    }
}`,
      c: `#include <stdio.h>
#include <string.h>
int dp[1001][1001];
int main() {
    char s1[1001], s2[1001];
    scanf("%s", s1);
    scanf("%s", s2);
    // DP solution for LCS
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s1, s2;
    cin >> s1 >> s2;
    // DP solution for LCS
    return 0;
}`,
    },
  },
];
