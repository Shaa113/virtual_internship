# Merge Sort Implementation
# Practical Use of AI Tools in Programming - Task 2
# An implementation of the Merge Sort divide-and-conquer algorithm

def merge_sort(arr):
    """
    Sorts a list in-place using the Merge Sort algorithm.
    Time Complexity: O(N log N) in all cases (best, average, worst)
    Space Complexity: O(N) auxiliary space needed for merging
    """
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left_half = arr[:mid]
    right_half = arr[mid:]
    
    # Recursive division of arrays
    merge_sort(left_half)
    merge_sort(right_half)
    
    # Pointers to track indices of sub-arrays
    i = 0  # Left half index
    j = 0  # Right half index
    k = 0  # Main array index
    
    # Merge sorted sub-arrays
    while i < len(left_half) and j < len(right_half):
        if left_half[i] < right_half[j]:
            arr[k] = left_half[i]
            i += 1
        else:
            arr[k] = right_half[j]
            j += 1
        k += 1
        
    # Check for remaining elements in left half
    while i < len(left_half):
        arr[k] = left_half[i]
        i += 1
        k += 1
        
    # Check for remaining elements in right half
    while j < len(right_half):
        arr[k] = right_half[j]
        j += 1
        k += 1
        
    return arr

# Simple driver code for manual verification
if __name__ == '__main__':
    unsorted_data = [38, 27, 43, 3, 9, 82, 10]
    print("Unsorted List:", unsorted_data)
    
    sorted_data = merge_sort(unsorted_data.copy())
    print("Sorted List:  ", sorted_data)
