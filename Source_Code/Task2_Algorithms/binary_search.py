# Binary Search Implementation
# Practical Use of AI Tools in Programming - Task 2
# Generates a standard recursive and iterative implementation of Binary Search

def binary_search_iterative(arr, target):
    """
    Performs Binary Search iteratively on a sorted list.
    Time Complexity: O(log N)
    Space Complexity: O(1)
    """
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid  # Return the index of the found element
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1  # Target is not in the array

def binary_search_recursive(arr, low, high, target):
    """
    Performs Binary Search recursively on a sorted list.
    Time Complexity: O(log N)
    Space Complexity: O(log N) due to function call stack
    """
    if low > high:
        return -1
        
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, mid + 1, high, target)
    else:
        return binary_search_recursive(arr, low, mid - 1, target)

# Simple driver code for manual verification
if __name__ == '__main__':
    sorted_numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
    search_target = 23
    
    print("Sorted List:", sorted_numbers)
    print("Searching for:", search_target)
    
    # Iterative test
    idx_iter = binary_search_iterative(sorted_numbers, search_target)
    print(f"Iterative Search Index Result: {idx_iter} (Value: {sorted_numbers[idx_iter]})")
    
    # Recursive test
    idx_rec = binary_search_recursive(sorted_numbers, 0, len(sorted_numbers)-1, search_target)
    print(f"Recursive Search Index Result: {idx_rec} (Value: {sorted_numbers[idx_rec]})")
