"""
Run this once to seed problems into the database:
    python seed.py
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

from app.models.models import Base, Problem

PROBLEMS = [
    {
        "title": "Two Sum",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "difficulty": "Easy",
        "topic": "Arrays",
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 9"},
            {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}
        ],
        "constraints": ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Only one valid answer exists"],
        "starter_code": {
            "python": "def two_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
            "javascript": "function twoSum(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (seen.has(comp)) return [seen.get(comp), i];\n        seen.set(nums[i], i);\n    }\n}",
            "java": "public int[] twoSum(int[] nums, int target) {\n    Map<Integer,Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int comp = target - nums[i];\n        if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}"
        }
    },
    {
        "title": "Longest Substring Without Repeating Characters",
        "description": "Given a string s, find the length of the longest substring without repeating characters.",
        "difficulty": "Medium",
        "topic": "Sliding Window",
        "examples": [
            {"input": 's = "abcabcbb"', "output": "3", "explanation": '"abc" has length 3'},
            {"input": 's = "bbbbb"', "output": "1"}
        ],
        "constraints": ["0 ≤ s.length ≤ 5×10⁴", "s consists of English letters, digits, symbols"],
        "starter_code": {
            "python": "def length_of_longest_substring(s: str) -> int:\n    char_set = set()\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    return max_len",
            "javascript": "function lengthOfLongestSubstring(s) {\n    const set = new Set();\n    let left = 0, max = 0;\n    for (let r = 0; r < s.length; r++) {\n        while (set.has(s[r])) set.delete(s[left++]);\n        set.add(s[r]);\n        max = Math.max(max, r - left + 1);\n    }\n    return max;\n}",
            "java": "public int lengthOfLongestSubstring(String s) {\n    Set<Character> set = new HashSet<>();\n    int left = 0, max = 0;\n    for (int r = 0; r < s.length(); r++) {\n        while (set.contains(s.charAt(r))) set.remove(s.charAt(left++));\n        set.add(s.charAt(r));\n        max = Math.max(max, r - left + 1);\n    }\n    return max;\n}"
        }
    },
    {
        "title": "Maximum Subarray",
        "description": "Given an integer array nums, find the subarray with the largest sum and return its sum. Use Kadane's algorithm.",
        "difficulty": "Medium",
        "topic": "Dynamic Programming",
        "examples": [
            {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "Subarray [4,-1,2,1] = 6"},
            {"input": "nums = [1]", "output": "1"}
        ],
        "constraints": ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
        "starter_code": {
            "python": "def max_sub_array(nums: list[int]) -> int:\n    max_sum = nums[0]\n    current = nums[0]\n    for num in nums[1:]:\n        current = max(num, current + num)\n        max_sum = max(max_sum, current)\n    return max_sum",
            "javascript": "function maxSubArray(nums) {\n    let max = nums[0], cur = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        max = Math.max(max, cur);\n    }\n    return max;\n}",
            "java": "public int maxSubArray(int[] nums) {\n    int max = nums[0], cur = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        max = Math.max(max, cur);\n    }\n    return max;\n}"
        }
    },
    {
        "title": "Valid Parentheses",
        "description": "Given a string s containing just '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "difficulty": "Easy",
        "topic": "Stack",
        "examples": [
            {"input": 's = "()"', "output": "true"},
            {"input": 's = "(]"', "output": "false"}
        ],
        "constraints": ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}'"],
        "starter_code": {
            "python": "def is_valid(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
            "javascript": "function isValid(s) {\n    const stack = [], map = {')':'(','}':'{',']':'['};\n    for (const c of s) {\n        if (map[c]) { if (stack.pop() !== map[c]) return false; }\n        else stack.push(c);\n    }\n    return stack.length === 0;\n}",
            "java": "public boolean isValid(String s) {\n    Deque<Character> stack = new ArrayDeque<>();\n    for (char c : s.toCharArray()) {\n        if (c=='('||c=='{'||c=='[') stack.push(c);\n        else if (stack.isEmpty()) return false;\n        else if (c==')'&&stack.pop()!='(') return false;\n        else if (c=='}'&&stack.pop()!='{') return false;\n        else if (c==']'&&stack.pop()!='[') return false;\n    }\n    return stack.isEmpty();\n}"
        }
    },
    {
        "title": "Binary Search",
        "description": "Given a sorted array of integers nums and an integer target, return the index of target. If not found return -1. Must be O(log n).",
        "difficulty": "Easy",
        "topic": "Searching",
        "examples": [
            {"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4"},
            {"input": "nums = [-1,0,3,5,9,12], target = 2", "output": "-1"}
        ],
        "constraints": ["1 ≤ nums.length ≤ 10⁴", "All nums unique", "nums sorted ascending"],
        "starter_code": {
            "python": "def search(nums: list[int], target: int) -> int:\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1",
            "javascript": "function search(nums, target) {\n    let left = 0, right = nums.length - 1;\n    while (left <= right) {\n        const mid = Math.floor((left + right) / 2);\n        if (nums[mid] === target) return mid;\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}",
            "java": "public int search(int[] nums, int target) {\n    int left = 0, right = nums.length - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}"
        }
    },
    {
        "title": "Contains Duplicate", "difficulty": "Easy", "topic": "Arrays",
        "description": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
        "examples": [{"input": "nums = [1,2,3,1]", "output": "true", "explanation": "1 appears at index 0 and 3"}, {"input": "nums = [1,2,3,4]", "output": "false"}],
        "constraints": ["1 ≤ nums.length ≤ 10⁵", "-10⁹ ≤ nums[i] ≤ 10⁹"],
        "starter_code": {
            "python": "def containsDuplicate(nums: list[int]) -> bool:\n    return len(nums) != len(set(nums))",
            "javascript": "function containsDuplicate(nums) {\n    return new Set(nums).size !== nums.length;\n}",
            "java": "public boolean containsDuplicate(int[] nums) {\n    Set<Integer> set = new HashSet<>();\n    for (int n : nums) if (!set.add(n)) return true;\n    return false;\n}"
        }
    },
    {
        "title": "Best Time to Buy and Sell Stock", "difficulty": "Easy", "topic": "Arrays",
        "description": "Given an array prices where prices[i] is the price of a stock on the ith day, return the maximum profit you can achieve from one buy and one sell. Return 0 if no profit is possible.",
        "examples": [{"input": "prices = [7,1,5,3,6,4]", "output": "5", "explanation": "Buy at 1, sell at 6"}, {"input": "prices = [7,6,4,3,1]", "output": "0"}],
        "constraints": ["1 ≤ prices.length ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"],
        "starter_code": {
            "python": "def maxProfit(prices: list[int]) -> int:\n    min_price = float('inf')\n    max_profit = 0\n    for price in prices:\n        min_price = min(min_price, price)\n        max_profit = max(max_profit, price - min_price)\n    return max_profit",
            "javascript": "function maxProfit(prices) {\n    let minPrice = Infinity, maxProfit = 0;\n    for (const p of prices) {\n        minPrice = Math.min(minPrice, p);\n        maxProfit = Math.max(maxProfit, p - minPrice);\n    }\n    return maxProfit;\n}",
            "java": "public int maxProfit(int[] prices) {\n    int minPrice = Integer.MAX_VALUE, maxProfit = 0;\n    for (int p : prices) { minPrice = Math.min(minPrice, p); maxProfit = Math.max(maxProfit, p - minPrice); }\n    return maxProfit;\n}"
        }
    },
    {
        "title": "Climbing Stairs", "difficulty": "Easy", "topic": "Dynamic Programming",
        "description": "You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. Return the number of distinct ways to reach the top.",
        "examples": [{"input": "n = 2", "output": "2", "explanation": "1+1 or 2"}, {"input": "n = 3", "output": "3", "explanation": "1+1+1, 1+2, or 2+1"}],
        "constraints": ["1 ≤ n ≤ 45"],
        "starter_code": {
            "python": "def climbStairs(n: int) -> int:\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b",
            "javascript": "function climbStairs(n) {\n    if (n <= 2) return n;\n    let a = 1, b = 2;\n    for (let i = 3; i <= n; i++) [a, b] = [b, a + b];\n    return b;\n}",
            "java": "public int climbStairs(int n) {\n    if (n <= 2) return n;\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; i++) { int tmp = a + b; a = b; b = tmp; }\n    return b;\n}"
        }
    },
    {
        "title": "Reverse Linked List", "difficulty": "Easy", "topic": "Linked Lists",
        "description": "Given the head of a singly linked list, reverse the list and return the reversed list's head.",
        "examples": [{"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}, {"input": "head = [1,2]", "output": "[2,1]"}],
        "constraints": ["0 ≤ length ≤ 5000", "-5000 ≤ Node.val ≤ 5000"],
        "starter_code": {
            "python": "def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev",
            "javascript": "function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        const nxt = curr.next;\n        curr.next = prev; prev = curr; curr = nxt;\n    }\n    return prev;\n}",
            "java": "public ListNode reverseList(ListNode head) {\n    ListNode prev = null, curr = head;\n    while (curr != null) {\n        ListNode nxt = curr.next; curr.next = prev; prev = curr; curr = nxt;\n    }\n    return prev;\n}"
        }
    },
    {
        "title": "Palindrome Number", "difficulty": "Easy", "topic": "Math",
        "description": "Given an integer x, return true if x is a palindrome (reads the same forward and backward), and false otherwise.",
        "examples": [{"input": "x = 121", "output": "true"}, {"input": "x = -121", "output": "false", "explanation": "Negative numbers are not palindromes"}],
        "constraints": ["-2³¹ ≤ x ≤ 2³¹ - 1"],
        "starter_code": {
            "python": "def isPalindrome(x: int) -> bool:\n    if x < 0:\n        return False\n    s = str(x)\n    return s == s[::-1]",
            "javascript": "function isPalindrome(x) {\n    if (x < 0) return false;\n    const s = String(x);\n    return s === s.split('').reverse().join('');\n}",
            "java": "public boolean isPalindrome(int x) {\n    if (x < 0) return false;\n    String s = Integer.toString(x);\n    return s.equals(new StringBuilder(s).reverse().toString());\n}"
        }
    },
    {
        "title": "Merge Two Sorted Lists", "difficulty": "Easy", "topic": "Linked Lists",
        "description": "Merge two sorted linked lists and return the merged list, which should also be sorted.",
        "examples": [{"input": "l1 = [1,2,4], l2 = [1,3,4]", "output": "[1,1,2,3,4,4]"}, {"input": "l1 = [], l2 = [0]", "output": "[0]"}],
        "constraints": ["0 ≤ length ≤ 50", "-100 ≤ Node.val ≤ 100"],
        "starter_code": {
            "python": "def mergeTwoLists(l1, l2):\n    dummy = ListNode(0)\n    cur = dummy\n    while l1 and l2:\n        if l1.val <= l2.val: cur.next = l1; l1 = l1.next\n        else: cur.next = l2; l2 = l2.next\n        cur = cur.next\n    cur.next = l1 or l2\n    return dummy.next",
            "javascript": "function mergeTwoLists(l1, l2) {\n    const dummy = new ListNode(0);\n    let cur = dummy;\n    while (l1 && l2) {\n        if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }\n        else { cur.next = l2; l2 = l2.next; }\n        cur = cur.next;\n    }\n    cur.next = l1 || l2;\n    return dummy.next;\n}",
            "java": "public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n    ListNode dummy = new ListNode(0), cur = dummy;\n    while (l1 != null && l2 != null) {\n        if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; } else { cur.next = l2; l2 = l2.next; }\n        cur = cur.next;\n    }\n    cur.next = (l1 != null) ? l1 : l2;\n    return dummy.next;\n}"
        }
    },
    {
        "title": "3Sum", "difficulty": "Medium", "topic": "Two Pointers",
        "description": "Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i, j, k are distinct and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
        "examples": [{"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"}, {"input": "nums = [0,0,0]", "output": "[[0,0,0]]"}],
        "constraints": ["3 ≤ nums.length ≤ 3000", "-10⁵ ≤ nums[i] ≤ 10⁵"],
        "starter_code": {
            "python": "def threeSum(nums: list[int]) -> list[list[int]]:\n    nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i - 1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l + 1]: l += 1\n                while l < r and nums[r] == nums[r - 1]: r -= 1\n                l += 1; r -= 1\n            elif s < 0: l += 1\n            else: r -= 1\n    return res",
            "javascript": "function threeSum(nums) {\n    nums.sort((a, b) => a - b);\n    const res = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i-1]) continue;\n        let l = i+1, r = nums.length-1;\n        while (l < r) {\n            const s = nums[i]+nums[l]+nums[r];\n            if (s===0){res.push([nums[i],nums[l],nums[r]]);while(l<r&&nums[l]===nums[l+1])l++;while(l<r&&nums[r]===nums[r-1])r--;l++;r--;}\n            else if(s<0)l++;else r--;\n        }\n    }\n    return res;\n}",
            "java": "public List<List<Integer>> threeSum(int[] nums) {\n    Arrays.sort(nums);\n    List<List<Integer>> res = new ArrayList<>();\n    for (int i = 0; i < nums.length-2; i++) {\n        if (i>0 && nums[i]==nums[i-1]) continue;\n        int l=i+1, r=nums.length-1;\n        while (l<r) {\n            int s=nums[i]+nums[l]+nums[r];\n            if(s==0){res.add(Arrays.asList(nums[i],nums[l++],nums[r--]));while(l<r&&nums[l]==nums[l-1])l++;while(l<r&&nums[r]==nums[r+1])r--;}\n            else if(s<0)l++;else r--;\n        }\n    }\n    return res;\n}"
        }
    },
    {
        "title": "Container With Most Water", "difficulty": "Medium", "topic": "Two Pointers",
        "description": "Given n integers representing heights of vertical lines, find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water.",
        "examples": [{"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49"}, {"input": "height = [1,1]", "output": "1"}],
        "constraints": ["2 ≤ height.length ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"],
        "starter_code": {
            "python": "def maxArea(height: list[int]) -> int:\n    l, r = 0, len(height) - 1\n    max_water = 0\n    while l < r:\n        max_water = max(max_water, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return max_water",
            "javascript": "function maxArea(height) {\n    let l=0, r=height.length-1, max=0;\n    while(l<r){\n        max=Math.max(max,Math.min(height[l],height[r])*(r-l));\n        if(height[l]<height[r])l++;else r--;\n    }\n    return max;\n}",
            "java": "public int maxArea(int[] height) {\n    int l=0, r=height.length-1, max=0;\n    while(l<r){\n        max=Math.max(max,Math.min(height[l],height[r])*(r-l));\n        if(height[l]<height[r])l++;else r--;\n    }\n    return max;\n}"
        }
    },
    {
        "title": "Product of Array Except Self", "difficulty": "Medium", "topic": "Arrays",
        "description": "Given an integer array nums, return an array where each element is the product of all other elements. Must run in O(n) without division.",
        "examples": [{"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]"}, {"input": "nums = [-1,1,0,-3,3]", "output": "[0,0,9,0,0]"}],
        "constraints": ["2 ≤ nums.length ≤ 10⁵", "-30 ≤ nums[i] ≤ 30"],
        "starter_code": {
            "python": "def productExceptSelf(nums: list[int]) -> list[int]:\n    n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix; prefix *= nums[i]\n    suffix = 1\n    for i in range(n-1, -1, -1):\n        res[i] *= suffix; suffix *= nums[i]\n    return res",
            "javascript": "function productExceptSelf(nums) {\n    const n=nums.length, res=new Array(n).fill(1);\n    let prefix=1;\n    for(let i=0;i<n;i++){res[i]=prefix;prefix*=nums[i];}\n    let suffix=1;\n    for(let i=n-1;i>=0;i--){res[i]*=suffix;suffix*=nums[i];}\n    return res;\n}",
            "java": "public int[] productExceptSelf(int[] nums) {\n    int n=nums.length; int[] res=new int[n]; Arrays.fill(res,1);\n    int prefix=1;\n    for(int i=0;i<n;i++){res[i]=prefix;prefix*=nums[i];}\n    int suffix=1;\n    for(int i=n-1;i>=0;i--){res[i]*=suffix;suffix*=nums[i];}\n    return res;\n}"
        }
    },
    {
        "title": "Find Minimum in Rotated Sorted Array", "difficulty": "Medium", "topic": "Searching",
        "description": "Given a sorted array rotated between 1 and n times, find the minimum element in O(log n) time.",
        "examples": [{"input": "nums = [3,4,5,1,2]", "output": "1"}, {"input": "nums = [4,5,6,7,0,1,2]", "output": "0"}],
        "constraints": ["1 ≤ nums.length ≤ 5000", "All integers are unique", "-5000 ≤ nums[i] ≤ 5000"],
        "starter_code": {
            "python": "def findMin(nums: list[int]) -> int:\n    left, right = 0, len(nums) - 1\n    while left < right:\n        mid = (left + right) // 2\n        if nums[mid] > nums[right]: left = mid + 1\n        else: right = mid\n    return nums[left]",
            "javascript": "function findMin(nums) {\n    let left=0, right=nums.length-1;\n    while(left<right){\n        const mid=Math.floor((left+right)/2);\n        if(nums[mid]>nums[right])left=mid+1;else right=mid;\n    }\n    return nums[left];\n}",
            "java": "public int findMin(int[] nums) {\n    int left=0, right=nums.length-1;\n    while(left<right){\n        int mid=left+(right-left)/2;\n        if(nums[mid]>nums[right])left=mid+1;else right=mid;\n    }\n    return nums[left];\n}"
        }
    },
    {
        "title": "House Robber", "difficulty": "Medium", "topic": "Dynamic Programming",
        "description": "You are a robber planning to rob houses along a street. Adjacent houses have alarm systems. Given nums[i] representing money in each house, return the maximum amount you can rob without triggering an alarm.",
        "examples": [{"input": "nums = [1,2,3,1]", "output": "4", "explanation": "Rob houses 0 and 2: 1+3=4"}, {"input": "nums = [2,7,9,3,1]", "output": "12"}],
        "constraints": ["1 ≤ nums.length ≤ 100", "0 ≤ nums[i] ≤ 400"],
        "starter_code": {
            "python": "def rob(nums: list[int]) -> int:\n    prev, curr = 0, 0\n    for n in nums:\n        prev, curr = curr, max(curr, prev + n)\n    return curr",
            "javascript": "function rob(nums) {\n    let prev=0, curr=0;\n    for(const n of nums)[prev,curr]=[curr,Math.max(curr,prev+n)];\n    return curr;\n}",
            "java": "public int rob(int[] nums) {\n    int prev=0, curr=0;\n    for(int n:nums){int tmp=Math.max(curr,prev+n);prev=curr;curr=tmp;}\n    return curr;\n}"
        }
    },
    {
        "title": "Coin Change", "difficulty": "Medium", "topic": "Dynamic Programming",
        "description": "Given an array of coin denominations and a total amount, return the fewest number of coins needed to make up that amount. Return -1 if it cannot be achieved.",
        "examples": [{"input": "coins = [1,5,11], amount = 15", "output": "3", "explanation": "5+5+5"}, {"input": "coins = [2], amount = 3", "output": "-1"}],
        "constraints": ["1 ≤ coins.length ≤ 12", "0 ≤ amount ≤ 10⁴"],
        "starter_code": {
            "python": "def coinChange(coins: list[int], amount: int) -> int:\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for coin in coins:\n        for i in range(coin, amount + 1):\n            dp[i] = min(dp[i], dp[i - coin] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
            "javascript": "function coinChange(coins, amount) {\n    const dp=new Array(amount+1).fill(Infinity); dp[0]=0;\n    for(const coin of coins)\n        for(let i=coin;i<=amount;i++)\n            dp[i]=Math.min(dp[i],dp[i-coin]+1);\n    return dp[amount]===Infinity?-1:dp[amount];\n}",
            "java": "public int coinChange(int[] coins, int amount) {\n    int[] dp=new int[amount+1]; Arrays.fill(dp,amount+1); dp[0]=0;\n    for(int coin:coins)\n        for(int i=coin;i<=amount;i++)\n            dp[i]=Math.min(dp[i],dp[i-coin]+1);\n    return dp[amount]>amount?-1:dp[amount];\n}"
        }
    },
    {
        "title": "Merge Intervals", "difficulty": "Medium", "topic": "Arrays",
        "description": "Given an array of intervals, merge all overlapping intervals and return an array of non-overlapping intervals covering all input intervals.",
        "examples": [{"input": "intervals = [[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]"}, {"input": "intervals = [[1,4],[4,5]]", "output": "[[1,5]]"}],
        "constraints": ["1 ≤ intervals.length ≤ 10⁴", "0 ≤ start ≤ end ≤ 10⁴"],
        "starter_code": {
            "python": "def merge(intervals: list[list[int]]) -> list[list[int]]:\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for start, end in intervals[1:]:\n        if start <= merged[-1][1]: merged[-1][1] = max(merged[-1][1], end)\n        else: merged.append([start, end])\n    return merged",
            "javascript": "function merge(intervals) {\n    intervals.sort((a,b)=>a[0]-b[0]);\n    const merged=[intervals[0]];\n    for(const [s,e] of intervals.slice(1)){\n        const last=merged[merged.length-1];\n        if(s<=last[1])last[1]=Math.max(last[1],e);else merged.push([s,e]);\n    }\n    return merged;\n}",
            "java": "public int[][] merge(int[][] intervals) {\n    Arrays.sort(intervals,(a,b)->a[0]-b[0]);\n    List<int[]> m=new ArrayList<>(); m.add(intervals[0]);\n    for(int i=1;i<intervals.length;i++){\n        int[] last=m.get(m.size()-1);\n        if(intervals[i][0]<=last[1])last[1]=Math.max(last[1],intervals[i][1]);else m.add(intervals[i]);\n    }\n    return m.toArray(new int[0][]);\n}"
        }
    },
    {
        "title": "Number of Islands", "difficulty": "Medium", "topic": "BFS/DFS",
        "description": "Given a 2D grid of '1's (land) and '0's (water), count the number of islands. An island is formed by connecting adjacent land cells horizontally or vertically.",
        "examples": [{"input": "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]", "output": "2"}, {"input": "grid = [[\"1\",\"1\",\"1\"],[\"0\",\"1\",\"0\"],[\"1\",\"1\",\"1\"]]", "output": "1"}],
        "constraints": ["1 ≤ rows, cols ≤ 300", "grid[i][j] is '0' or '1'"],
        "starter_code": {
            "python": "def numIslands(grid: list[list[str]]) -> int:\n    if not grid: return 0\n    count = 0\n    def dfs(r, c):\n        if r<0 or r>=len(grid) or c<0 or c>=len(grid[0]) or grid[r][c]=='0': return\n        grid[r][c]='0'\n        for dr,dc in[(1,0),(-1,0),(0,1),(0,-1)]: dfs(r+dr,c+dc)\n    for r in range(len(grid)):\n        for c in range(len(grid[0])):\n            if grid[r][c]=='1': dfs(r,c); count+=1\n    return count",
            "javascript": "function numIslands(grid) {\n    const rows=grid.length,cols=grid[0].length;\n    let count=0;\n    const dfs=(r,c)=>{\n        if(r<0||r>=rows||c<0||c>=cols||grid[r][c]==='0')return;\n        grid[r][c]='0';\n        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>dfs(r+dr,c+dc));\n    };\n    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(grid[r][c]==='1'){dfs(r,c);count++;}\n    return count;\n}",
            "java": "public int numIslands(char[][] grid) {\n    int count=0;\n    for(int r=0;r<grid.length;r++)for(int c=0;c<grid[0].length;c++)if(grid[r][c]=='1'){dfs(grid,r,c);count++;}\n    return count;\n}\nvoid dfs(char[][] g,int r,int c){\n    if(r<0||r>=g.length||c<0||c>=g[0].length||g[r][c]=='0')return;\n    g[r][c]='0'; dfs(g,r+1,c);dfs(g,r-1,c);dfs(g,r,c+1);dfs(g,r,c-1);\n}"
        }
    },
    {
        "title": "Subsets", "difficulty": "Medium", "topic": "Backtracking",
        "description": "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
        "examples": [{"input": "nums = [1,2,3]", "output": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"}, {"input": "nums = [0]", "output": "[[],[0]]"}],
        "constraints": ["1 ≤ nums.length ≤ 10", "-10 ≤ nums[i] ≤ 10", "All nums are unique"],
        "starter_code": {
            "python": "def subsets(nums: list[int]) -> list[list[int]]:\n    res = []\n    def backtrack(start, path):\n        res.append(path[:])\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i+1, path)\n            path.pop()\n    backtrack(0, [])\n    return res",
            "javascript": "function subsets(nums) {\n    const res=[];\n    const bt=(start,path)=>{\n        res.push([...path]);\n        for(let i=start;i<nums.length;i++){path.push(nums[i]);bt(i+1,path);path.pop();}\n    };\n    bt(0,[]);\n    return res;\n}",
            "java": "public List<List<Integer>> subsets(int[] nums) {\n    List<List<Integer>> res=new ArrayList<>(); backtrack(nums,0,new ArrayList<>(),res); return res;\n}\nvoid backtrack(int[] nums,int start,List<Integer> path,List<List<Integer>> res){\n    res.add(new ArrayList<>(path));\n    for(int i=start;i<nums.length;i++){path.add(nums[i]);backtrack(nums,i+1,path,res);path.remove(path.size()-1);}\n}"
        }
    },
    {
        "title": "Word Break", "difficulty": "Medium", "topic": "Dynamic Programming",
        "description": "Given a string s and a dictionary wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
        "examples": [{"input": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]", "output": "true"}, {"input": "s = \"catsandog\", wordDict = [\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]", "output": "false"}],
        "constraints": ["1 ≤ s.length ≤ 300", "1 ≤ wordDict.length ≤ 1000"],
        "starter_code": {
            "python": "def wordBreak(s: str, wordDict: list[str]) -> bool:\n    words = set(wordDict)\n    dp = [False] * (len(s) + 1)\n    dp[0] = True\n    for i in range(1, len(s) + 1):\n        for j in range(i):\n            if dp[j] and s[j:i] in words: dp[i] = True; break\n    return dp[len(s)]",
            "javascript": "function wordBreak(s, wordDict) {\n    const words=new Set(wordDict), dp=new Array(s.length+1).fill(false); dp[0]=true;\n    for(let i=1;i<=s.length;i++)\n        for(let j=0;j<i;j++)\n            if(dp[j]&&words.has(s.slice(j,i))){dp[i]=true;break;}\n    return dp[s.length];\n}",
            "java": "public boolean wordBreak(String s, List<String> wordDict) {\n    Set<String> words=new HashSet<>(wordDict);\n    boolean[] dp=new boolean[s.length()+1]; dp[0]=true;\n    for(int i=1;i<=s.length();i++)\n        for(int j=0;j<i;j++)\n            if(dp[j]&&words.contains(s.substring(j,i))){dp[i]=true;break;}\n    return dp[s.length()];\n}"
        }
    },
    {
        "title": "Kth Largest Element in an Array", "difficulty": "Medium", "topic": "Sorting",
        "description": "Given an integer array nums and an integer k, return the kth largest element in the array.",
        "examples": [{"input": "nums = [3,2,1,5,6,4], k = 2", "output": "5"}, {"input": "nums = [3,2,3,1,2,4,5,5,6], k = 4", "output": "4"}],
        "constraints": ["1 ≤ k ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
        "starter_code": {
            "python": "def findKthLargest(nums: list[int], k: int) -> int:\n    import heapq\n    return heapq.nlargest(k, nums)[-1]",
            "javascript": "function findKthLargest(nums, k) {\n    nums.sort((a,b)=>b-a);\n    return nums[k-1];\n}",
            "java": "public int findKthLargest(int[] nums, int k) {\n    Arrays.sort(nums);\n    return nums[nums.length-k];\n}"
        }
    },
    {
        "title": "Rotate Array", "difficulty": "Medium", "topic": "Arrays",
        "description": "Given an integer array nums, rotate the array to the right by k steps.",
        "examples": [{"input": "nums = [1,2,3,4,5,6,7], k = 3", "output": "[5,6,7,1,2,3,4]"}, {"input": "nums = [-1,-100,3,99], k = 2", "output": "[3,99,-1,-100]"}],
        "constraints": ["1 ≤ nums.length ≤ 10⁵", "0 ≤ k ≤ 10⁵"],
        "starter_code": {
            "python": "def rotate(nums: list[int], k: int) -> None:\n    k %= len(nums)\n    nums[:] = nums[-k:] + nums[:-k]",
            "javascript": "function rotate(nums, k) {\n    k%=nums.length;\n    nums.unshift(...nums.splice(nums.length-k));\n}",
            "java": "public void rotate(int[] nums, int k) {\n    int n=nums.length; k%=n;\n    reverse(nums,0,n-1);reverse(nums,0,k-1);reverse(nums,k,n-1);\n}\nvoid reverse(int[] nums,int l,int r){while(l<r){int t=nums[l];nums[l++]=nums[r];nums[r--]=t;}}"
        }
    },
    {
        "title": "Trapping Rain Water", "difficulty": "Hard", "topic": "Two Pointers",
        "description": "Given n non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.",
        "examples": [{"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"}, {"input": "height = [4,2,0,3,2,5]", "output": "9"}],
        "constraints": ["1 ≤ n ≤ 2×10⁴", "0 ≤ height[i] ≤ 10⁵"],
        "starter_code": {
            "python": "def trap(height: list[int]) -> int:\n    l, r = 0, len(height) - 1\n    left_max = right_max = water = 0\n    while l < r:\n        if height[l] < height[r]:\n            if height[l] >= left_max: left_max = height[l]\n            else: water += left_max - height[l]\n            l += 1\n        else:\n            if height[r] >= right_max: right_max = height[r]\n            else: water += right_max - height[r]\n            r -= 1\n    return water",
            "javascript": "function trap(height) {\n    let l=0,r=height.length-1,lMax=0,rMax=0,water=0;\n    while(l<r){\n        if(height[l]<height[r]){\n            height[l]>=lMax?(lMax=height[l]):(water+=lMax-height[l]);l++;\n        }else{\n            height[r]>=rMax?(rMax=height[r]):(water+=rMax-height[r]);r--;\n        }\n    }\n    return water;\n}",
            "java": "public int trap(int[] height) {\n    int l=0,r=height.length-1,lMax=0,rMax=0,water=0;\n    while(l<r){\n        if(height[l]<height[r]){\n            if(height[l]>=lMax)lMax=height[l];else water+=lMax-height[l];l++;\n        }else{\n            if(height[r]>=rMax)rMax=height[r];else water+=rMax-height[r];r--;\n        }\n    }\n    return water;\n}"
        }
    },
    {
        "title": "Median of Two Sorted Arrays", "difficulty": "Hard", "topic": "Searching",
        "description": "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays combined. The overall run time complexity should be O(log(m+n)).",
        "examples": [{"input": "nums1 = [1,3], nums2 = [2]", "output": "2.0", "explanation": "Merged: [1,2,3], median=2"}, {"input": "nums1 = [1,2], nums2 = [3,4]", "output": "2.5"}],
        "constraints": ["0 ≤ m, n ≤ 1000", "-10⁶ ≤ nums1[i], nums2[i] ≤ 10⁶"],
        "starter_code": {
            "python": "def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:\n    merged = sorted(nums1 + nums2)\n    n = len(merged)\n    if n % 2 == 1: return float(merged[n // 2])\n    return (merged[n // 2 - 1] + merged[n // 2]) / 2.0",
            "javascript": "function findMedianSortedArrays(nums1, nums2) {\n    const merged=[...nums1,...nums2].sort((a,b)=>a-b);\n    const n=merged.length;\n    return n%2===1?merged[Math.floor(n/2)]:(merged[n/2-1]+merged[n/2])/2;\n}",
            "java": "public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n    int[] m=new int[nums1.length+nums2.length];\n    System.arraycopy(nums1,0,m,0,nums1.length);\n    System.arraycopy(nums2,0,m,nums1.length,nums2.length);\n    Arrays.sort(m); int n=m.length;\n    return n%2==1?m[n/2]:(m[n/2-1]+m[n/2])/2.0;\n}"
        }
    }
]

async def main():
    import ssl as _ssl
    _url = DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "")
    _ssl_ctx = _ssl.create_default_context() if "sslmode=require" in DATABASE_URL else False
    engine = create_async_engine(
        _url,
        connect_args={"ssl": _ssl_ctx} if _ssl_ctx else {},
    )
    Session = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with Session() as session:
        for p in PROBLEMS:
            problem = Problem(**p)
            session.add(problem)
        await session.commit()
        print(f"Seeded {len(PROBLEMS)} problems successfully!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())