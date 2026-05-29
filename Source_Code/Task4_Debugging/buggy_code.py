# Task 4: Debugging with AI (10 Marks) 
# Students are given buggy code.

numbers = [1,2,3,4,5] 
sum = 0 
for i in range(0, len(numbers)+1): 
    sum += numbers[i] 
print("Average:", sum/0)
