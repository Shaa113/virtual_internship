

def calculate_average(nums):
    """
    Safely calculates and returns the average of a list of numbers.
    Avoids shadowing built-ins and handles division by zero.
    """
    # Defensive programming: check if the list is empty to prevent ZeroDivisionError
    if not nums:
        print("[Warning] List is empty. Cannot compute average.")
        return 0.0
        
    # LOGICAL ERROR FIXED: Avoid shadowing the built-in 'sum' function by renaming the variable.
    running_total = 0 
    
    # RUNTIME ERROR FIXED: Correct range upper limit to prevent IndexOutOfBounds.
    # The range should be from 0 to len(nums) - 1. In Python, range(start, stop) is exclusive of stop,
    # so range(0, len(nums)) iterates from index 0 to len(nums)-1.
    for i in range(0, len(nums)): 
        running_total += nums[i] 
        
    # RUNTIME ERROR FIXED: Calculate the average by dividing by len(nums) instead of dividing by zero.
    average_value = running_total / len(nums)
    return average_value

# Driver code
if __name__ == '__main__':
    numbers = [1, 2, 3, 4, 5]
    print("Numbers List:", numbers)
    
    # Calculate and display the result
    avg = calculate_average(numbers)
    print("Average:", avg)
    
    # Test with empty list to verify robust error-handling
    empty_list = []
    print("\nTesting empty list:")
    avg_empty = calculate_average(empty_list)
    print("Average of empty list:", avg_empty)
