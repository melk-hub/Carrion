from openai import OpenAI
import os
import json

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def exctract_data_from_email(email_body):
    result = client.chat.completions.create(
    model="gpt-3.5-turbo-1106",
        messages = [
            {"role": "system", "content": "You are an assistant that extracts keywords from emails."},
            {"role": "user", "content": f"Extrait les mots-clés suivants de cet email : nom de l'entreprise et poste(le plus precis possible). La reponse doit etre sous format json avec les keys en miniscule {{entreprise: '', poste: ''}} Email : {email_body}."}
        ]
    )

    # result = client.completions.create(
    #     model="gpt-3.5-turbo-instruct",
    #     prompt=f"Extrait les mots-clés suivants de cet email : nom de l'entreprise et poste. Email : {email_body}. La reponse doit etre sous un format json (entreprise: nom de l entreprise, poste: nom du poste)",
    # )
    test = json.loads(result.choices[0].message.content.strip())
    # print(test)
    return(test)
    # print(result.choices[0].message.content.strip())
    # print(result.choices[0].text.strip())
