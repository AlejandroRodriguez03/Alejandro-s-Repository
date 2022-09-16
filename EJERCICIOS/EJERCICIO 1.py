deposit = float(input("How much money do you will to deposit?: "))
profit = deposit * 0.04
year1 = deposit + profit
profit = year1 * 0.04
year2 = year1 + profit
profit = year2 * 0.04
year3 = year2 + profit
print(f"In first year you will earn {round(year1,2)}")
print(f"In second year you will earn {round(year2,2)}")
print(f"In third year you will earn {round(year3,2)}")