import re
import json
import os

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Collect all IDs
card_ids = set()

# 1. From coreBoard.ts
with open(os.path.join(root_dir, 'frontend', 'src', 'data', 'coreBoard.ts'), 'r', encoding='utf-8') as f:
    text = f.read()
    for m in re.finditer(r"id:\s*['\"]([^'\"]+)['\"]", text):
        card_ids.add(m.group(1))

# 2. From assets.ts
with open(os.path.join(root_dir, 'frontend', 'src', 'data', 'assets.ts'), 'r', encoding='utf-8') as f:
    text = f.read()
    for m in re.finditer(r"id:\s*['\"]([^'\"]+)['\"]", text):
        card_ids.add(m.group(1))

# Keyword mappings
DEFAULT_KEYWORDS = {
    'core_yes': 'yes',
    'core_no': 'no',
    'core_please': 'please',
    'core_thank_you': 'thank you',
    'core_thanks': 'thank you',
    'core_sorry': 'sorry',
    'core_hello': 'hello',
    'core_i': 'me',
    'core_you': 'you',
    'core_he': 'boy',
    'core_she': 'girl',
    'core_we': 'we',
    'core_they': 'they',
    'core_it': 'it',
    'core_want': 'want',
    'core_like': 'like',
    'core_need': 'need',
    'core_have': 'have',
    'core_go': 'go',
    'core_eat': 'eat',
    'core_drink': 'drink',
    'core_play': 'play',
    'core_help': 'help',
    'core_stop': 'stop',
    'core_more': 'more',
    'core_again': 'again',
    'core_finished': 'finish',
    'core_not': 'no',
    'core_my': 'mine',
    'core_good': 'good',
    'core_bad': 'bad',
    'core_what': 'what',
    'core_where': 'where',
    'core_who': 'who',
    'core_here': 'here',
    'core_there': 'there',
    'core_can': 'can',
    'core_will': 'will',
    'core_do': 'do',
    'core_see': 'see',
    'core_bathroom': 'toilet',
    'core_different': 'different',
    'folder_people': 'people',
    'folder_food': 'food',
    'folder_drinks': 'drink',
    'folder_things': 'objects',
    'folder_places': 'place',
    'folder_feelings': 'emotions',
    'folder_body_health': 'health',
    'folder_actions': 'action',
    'folder_questions': 'question',
    'folder_time': 'clock',
    'folder_describe': 'shapes',
    'folder_school': 'school',
    'folder_home': 'house',
    'folder_situations': 'conversation',
    'folder_my_phrases': 'star',
    'folder_more_topics': 'topics',
    'food': 'food',
    'food_pizza': 'pizza',
    'food_rice': 'rice',
    'food_bread': 'bread',
    'food_apple': 'apple',
    'food_snack': 'snack',
    'drinks': 'drink',
    'drink_water': 'water',
    'drink_milk': 'milk',
    'drink_tea': 'tea',
    'drink_juice': 'juice',
    'people': 'people',
    'ppl_mom': 'mother',
    'ppl_dad': 'father',
    'ppl_friend': 'friend',
    'ppl_doctor': 'doctor',
    'ppl_teacher': 'teacher',
    'feelings': 'emotions',
    'feel_happy': 'happy',
    'feel_sad': 'sad',
    'feel_angry': 'angry',
    'feel_calm': 'calm',
    'feel_tired': 'tired',
    'feel_scared': 'scared',
    'things': 'objects',
    'thing_book': 'book',
    'thing_pencil': 'pencil',
    'thing_ball': 'ball',
    'thing_bag': 'bag',
    'thing_phone': 'phone',
    'places': 'place',
    'place_home': 'house',
    'place_school': 'school',
    'place_park': 'park',
    'place_shop': 'shop',
    'place_hospital': 'hospital',
    'body_health': 'health',
    'hlth_pain': 'pain',
    'hlth_fever': 'fever',
    'hlth_medicine': 'medicine',
    'hlth_doctor': 'doctor',
    'hlth_headache': 'headache',
    'hlth_stomach': 'stomach',
    'actions': 'action',
    'act_come': 'come',
    'act_wash': 'wash',
    'act_sleep': 'sleep',
    'act_read': 'read',
    'act_walk': 'walk',
    'act_sit': 'sit',
    'questions': 'question',
    'q_why': 'why',
    'q_how': 'how',
    'q_what': 'what',
    'q_where': 'where',
    'q_who': 'who',
    'q_when': 'when',
    'time': 'clock',
    'time_now': 'now',
    'time_later': 'later',
    'time_today': 'today',
    'time_tomorrow': 'tomorrow',
    'time_yesterday': 'yesterday',
    'describe': 'shapes',
    'desc_big': 'big',
    'desc_small': 'small',
    'desc_good': 'good',
    'desc_bad': 'bad',
    'desc_hot': 'hot',
    'desc_cold': 'cold',
    'school': 'school',
    'sch_book': 'book',
    'sch_pencil': 'pencil',
    'sch_desk': 'desk',
    'home': 'house',
    'hm_bed': 'bed',
    'hm_kitchen': 'kitchen',
    'play': 'play',
    'ply_ball': 'ball',
    'travel': 'travel',
    'trv_bus': 'bus',
    'trv_car': 'car',
    'shopping': 'shopping',
    'shp_cart': 'cart',
    'situations': 'conversation',
    'my_phrases': 'star',
    'more_topics': 'topics'
}

result = {}
for cid in sorted(card_ids):
    if cid in DEFAULT_KEYWORDS:
        result[cid] = DEFAULT_KEYWORDS[cid]
    else:
        # derive clean keyword from ID
        clean = cid.replace('core_', '').replace('folder_', '').replace('thing_', '').replace('act_', '').replace('desc_', '').replace('sch_', '').replace('hm_', '').replace('trv_', '').replace('shp_', '').replace('hlth_', '').replace('feel_', '').replace('ppl_', '').replace('food_', '').replace('drink_', '').replace('_card', '').replace('_place', '').replace('_drink', '').replace('_food', '')
        result[cid] = clean

out_path = os.path.join(root_dir, 'scripts', 'pictogram-words.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"Generated {len(result)} pictogram word mappings in {out_path}")
