def retrieve_and_augment(query, index, model, registrations, k=5):
    """Retrieve relevant log entries and create an augmented prompt."""
    query_embedding = model.encode([query], convert_to_numpy=True)
    
    distances, indices = index.search(query_embedding, k)
    
    context = [registrations[idx]["text"] for idx in indices[0]]
    context_str = "\n".join(context)
    
    prompt = f"""Based on the following registration logs:
{context_str}

Answer the user's query: {query}"""
    
    return prompt