def print_welcome():
    print("****Welcome****")

def get_user_option(dict):
    for key, value in dict.items():
        for key_interno, value_interno in value.items():
            print(f"{key} - {value_interno}", end = "")
        print("")
    return input("Please enter a option: ")

def get_client_data(study):
    client = {
        "id": input("Please enter the client id: "),
        "age": input("Please enter the client age: "),
        "gender": input("Please enter the client M or F: "),
        "study":study
    }
    return client

def print_invoice(client):
    print("***RECEIPT***")
    print("ID:",client.get("id"))
    print("Age:",client.get("age"))
    print("Gender:",client.get("gender"))
    print("Total:",client.get("total"))

def get_net_amount(cliente, estudios):
    return  estudios.get(cliente.get("study")).get("price")

def get_discount(client,net_amount,cont):
    discount = 0
    if client.get("gender") == "F" and int(client.get("age")) > 55:
        discount += net_amount * 0.25
    elif client.get("gender") == "M" and int(client.get("age")) > 65:
        discount += net_amount * 0.25
    if cont %2 != 0:
        discount += net_amount*0.02
    
    return discount
    


def main():
    studies_dict_values = {
        "U":{
            "name":"Ultrasonido",
            "price": 8900
            },
        "T":{
            "name":"Tomogragia",
            "price": 12640
        },
        "R":{
            "name":"Resonancia",
            "price": 15600
        }
    }
    clients = []
    client_u = 0
    client_t = 0
    client_r = 0
    total_discounts = 0
    total_day = 0
    total_u = 0
    total_r = 0
    total_t = 0
    print_welcome()
    while True:
        option = get_user_option(studies_dict_values)
        client = get_client_data(option)
        clients.append(client)
        net_amount = get_net_amount(client,studies_dict_values)
        discount = get_discount(client,net_amount,len(clients))
        total_discounts += discount 
        total_amount = net_amount - discount
        client["total"] = total_amount
        total_day+=total_amount

        if option.upper() == "U":
            client_u +=1
            total_u += total_amount
        elif option.upper() == "T":
            client_t +=1
            total_t += total_amount
        elif option.upper() == "R":
            client_r +=1
            total_r += total_amount
        print_invoice(client)
        if input("Do you want to exit: Y-Yes - N-No") == "Y":
            break

    print("Clients for U:",client_u)
    print("Clients for T:",client_t)
    print("Clients for R:",client_r)
    print("Total Discounts:",total_discounts)
    print("Total:",total_day)
    if(len(clients) > 0):
        print("Total:",total_day/len(clients))
    else:
        print("Total: 0")
    if(client_u > 0):
        print("Total U:",total_u/client_u)
    else:
        print("Total U: 0")
    if(client_t > 0):
        print("Total T:",total_u/client_t)
    else:
        print("Total T: 0")
    if(client_r > 0):
        print("Total R:",total_u/client_r)
    else:
        print("Total R: 0")
    
        
main()