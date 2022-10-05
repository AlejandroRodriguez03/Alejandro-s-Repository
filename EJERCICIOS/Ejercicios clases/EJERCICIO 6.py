def main():
    n = int(input())
    negative_int(n)

def negative_int(number):
    for i in range(number):
        print(pow(i, 2))

if __name__ == '__main__':
    main()