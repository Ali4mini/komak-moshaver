from file.models import PropertyBase


def build_property_data_string(p: PropertyBase) -> str:
    """
    Takes a property instance and converts it into a clean,
    formatted string for appending to a prompt.
    """
    lines = ["**## Property Data to Use ##**"]

    lines.append(f"- Property Type: {p.get_property_type_display()}")
    lines.append(f"- Address: {p.address}")

    if p.m2:
        lines.append(f"- Square Meters: {p.m2}")
    if p.year:
        lines.append(f"- Year Built: {p.year}")
    if p.bedroom:
        lines.append(f"- Bedrooms: {p.bedroom}")

    lines.append(f'- Elevator: {"دارد" if p.elevator else "ندارد"}')
    lines.append(f'- Parking: {"دارد" if p.parking else "ندارد"}')
    lines.append(f'- Storage: {"دارد" if p.storage else "ندارد"}')
    lines.append(f'- Lobby Man: {"دارد" if p.lobbyMan else "ندارد"}')

    if p.description:
        lines.append(f"- Agent's Notes: {p.description}")

    return "\n".join(lines)


def generate_listing_prompt(property: PropertyBase, template: str) -> str:
    """
    Loads the prompt template from a file or string, populates it with property data,
    and returns the final prompt string.
    """

    # NOTE: the tempalte prop can be a path to a pre-defiend prompt(most likely stored somewhere in the server with a interface for agents to add and delete saved prompts)

    try:
        with open(template, "r", encoding="utf-8") as f:
            template_string = f.read()
    except FileNotFoundError as e:
        return f"Error: Prompt template file not found. {e}"

    data_string = build_property_data_string(property)
    final_prompt = template_string + data_string

    return final_prompt
