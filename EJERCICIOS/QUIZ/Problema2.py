medications = {
        "prescription": {
            "antibiotics": {
                "skin": [
                    {
                        "id": 1,
                        "name": "Clindamicine",
                        "price": 300
                    },
                    {
                        "id": 2,
                        "name": "Cefadroxil",
                        "price": 350
                    },
                    {
                        "id": 3,
                        "name": "Amoxicillin",
                        "price": 320
                    }
                ],
                "respiratory-system":[
                    {
                        "id": 4,
                        "name": "Citromicine",
                        "price": 380
                    },
                    {
                        "id": 5,
                        "name": "Levofloxacine",
                        "price": 125
                    },
                    {
                        "id": 6,
                        "name": "Azitromicine",
                        "price": 740
                    }
                ]
            },
            "analgesic": {
                "anti-inflammatories": [
                    {
                        "id": 7,
                        "name": "HYDROCODONE-IBUPROFEN",
                        "price": 150
                    },
                    {
                        "id": 8,
                        "name": "IBUDONE",
                        "price": 180
                    }
                ]
            }
        },
        "non-prescription": {
            "non-prescription analgesic": {
                "general": [
                    {
                        "id": 9,
                        "name": "Acetaminophen",
                        "price": 15
                    },
                    {
                        "id": 10,
                        "name": "Ibuprofen",
                        "price": 20
                    }
                ]
            },
            "non-prescription antihistamine": {
                "antiallergic": [
                    {
                        "id": 11,
                        "name": "Loratadine",
                        "price": 12
                    },
                    {
                        "id": 12,
                        "name": "Desler M",
                        "price": 8
                    },
                    {
                        "id": 13,
                        "name": "Allegra",
                        "price": 21
                    },
                    {
                        "id": 14,
                        "name": "Fexofenadine",
                        "price": 18
                    }
                ]
            }
        }
    }
print('-----------------------')
print('-WELCOME TO SAMAN-LABS-')
print('-----------------------')

while True:
    print('1. SEE INVENTORY')
    print('2. REGISTER PURCHASE')
    print('3. EXIT TO THE MAIN MENU')
    print()
    option = int(input('--->'))
    print()
    available_medications = {1:'prescription', 2:'non-prescription'}

    if option == 1:
     for types,brands in medications.items():
           for brand_name, medications_list in brands.items():
                print(brand_name)

     antibiotics = ['skins',"respiratory-system"]
     skins = [('id: 1','name: Clindamicine','price: 300'),('id: 2','name:Cefadroxil','price: 350'),('id: 3','name:Amoxicillin','price: 320')]
     respiratory_system = [('id: 4','name: Citromicine','price: 380'),('id: 5','name:Levofloxacine','price: 125'),('id: 6','name:Azitromicine','price: 740')]
     print('The available antibiotics are:' +str(antibiotics),str(skins))
     print(str(antibiotics),str(skins),str(respiratory_system))

     analgesic = ['anti-inflammatories']
     
     print('The available analgesics are:'+str(analgesic))
     print(str(analgesic))

     non_prescription_analgesic = ['general']
     print('The available non_prescription_analgesic are:' +str(non_prescription_analgesic))

     non_prescription_antihistamine = ['antiallergic']
     print('The available non_prescription_antihistamine are:' +str(non_prescription_antihistamine))

     if option == 3:
          break