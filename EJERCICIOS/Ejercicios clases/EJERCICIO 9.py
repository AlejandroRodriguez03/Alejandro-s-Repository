number = int(input('Please enter a number:'))

for i in range(1, number+1, 2):
    for j in range(i, 0, -2):
        print(j, end=" ")
    print("")