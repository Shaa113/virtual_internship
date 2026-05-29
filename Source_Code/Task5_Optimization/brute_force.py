# Brute-Force Solution (Two Sum Problem)
# Practical Use of AI Tools in Programming - Task 5
# Time Complexity: O(N^2) due to nested loops.
# Space Complexity: O(1) auxiliary space.

def find_pair_brute_force(arr, target):
    """
    Finds if there exists a pair of numbers that sum to the target value.
    Iterates through all possible pairs using a nested loop structure.
    """
    n = len(arr)
    # Outer loop for first number
    for i in range(n):
        # Inner loop for second number
        for j in range(i + 1, n):
            # Check if sum matches target
            if arr[i] + arr[j] == target:
                return (arr[i], arr[j])  # Pair found
    return None  # No pair matches

# Driver code
if __name__ == '__main__':
    data = [10, 15, 3, 7, 8, 20, 1, 9]
    target_sum = 17
    
    print("Array:", data)
    print("Target Sum:", target_sum)
    
    pair = find_pair_brute_force(data, target_sum)
    if pair:
        print(f"[Success] Found pair: {pair[0]} + {pair[1]} = {target_sum}")
    else:
        print("[Info] No matching pair found.")
