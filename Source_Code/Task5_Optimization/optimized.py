# Optimized Solution (Two Sum Problem)
# Practical Use of AI Tools in Programming - Task 5
# Time Complexity: O(N) since we traverse the list only once.
# Space Complexity: O(N) to store visited numbers in a hash set.

def find_pair_optimized(arr, target):
    """
    Finds if there exists a pair of numbers that sum to the target value.
    Uses a hash set (Python set) to achieve linear time complexity O(N).
    """
    # A set allows O(1) average time complexity for lookups
    visited = set()
    
    for num in arr:
        # Calculate the required complement value
        complement = target - num
        
        # Check if the complement has already been seen in the array
        if complement in visited:
            return (complement, num)  # Pair found
            
        # Add the current number to the visited set
        visited.add(num)
        
    return None  # No pair matches

# Driver code
if __name__ == '__main__':
    data = [10, 15, 3, 7, 8, 20, 1, 9]
    target_sum = 17
    
    print("Array:", data)
    print("Target Sum:", target_sum)
    
    pair = find_pair_optimized(data, target_sum)
    if pair:
        print(f"[Success] Found pair: {pair[0]} + {pair[1]} = {target_sum}")
    else:
        print("[Info] No matching pair found.")
