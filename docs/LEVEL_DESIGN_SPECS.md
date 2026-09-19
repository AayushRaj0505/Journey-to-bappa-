# 📜 Level Design, Puzzle Logic & Narrative Specifications

This document outlines the level-by-level story flow, puzzle logic, Astha distribution, passwords, and secrets across the entire game.

---

## 🌟 Narrative Premise

A young child sets off on a spiritual and emotional quest across four distinct realms to reach Lord Ganesha (**Bappa**):
1. **The Bedroom (Level 1)**: Overcoming initial confusion in the familiar safety of home.
2. **The Dark Diya Maze (Level 2)**: Overcoming fear of the dark through faith, guided by the holy Diya.
3. **The Living Room (Level 3)**: Keen listening and patience, decoding subtle Morse whispers left by elders.
4. **The Final Sanctuary (Level 4)**: Uniting the sacred seals of the journey to awaken the temple portal.

---

## 🪔 Complete Astha System & Divine Hints Balance

Astha points accumulate up to a maximum of **100**. Whenever a key milestone is reached, the **Divine Hint Modal** automatically displays for **5 seconds** to reveal the next sacred seal. Players can also revisit unlocked hints anytime via the **Pause Menu** or by clicking the top-left **Astha HUD**.

| Level | Action | Astha Granted | Total Astha | Unlocked Seal | Clue Inscription |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **Level 1** | Pray before Bappa's Bedroom Portrait | **+20** | **20 / 100** | **Seal 1: Elephant** | *"The noble elephant heralds new beginnings and clear paths."* |
| **Level 2** | Pray before 1st Maze Bappa Idol (NW) | **+10** | **30 / 100** | **Seal 2: Diya** | *"A single diya pierces through the deepest shadows."* |
| **Level 2** | Pray before 2nd & 3rd Idols (SW & SE) | **+5 each** | **40 / 100** | — | *"Bappa's protective aura shelters your every step."* |
| **Level 3** | Open Secret Locker & Combine Artefact | **+10** | **50 / 100** | **Seal 3: Trident** | *"The Trishula commands strength, clarity, and inner resolve."* |
| **Level 4** | Pray before Lord Ganesha's Sanctuary Idol | **+50** | **100 / 100** | **Seal 4: Temple** | *"The journey comes full circle: Elephant ➔ Diya ➔ Trident ➔ Temple."* |

---

## 🧩 Level-by-Level Walkthrough & Solutions

### Level 1: The Bedroom
- **Primary Goal**: Assemble the bedroom key and obtain the first Artefact Fragment.
- **Puzzle 1 (Cupboard Keypad)**: Code is **`372`** (discovered on the desk note). Unlocks the cupboard containing the screwdriver.
- **Puzzle 2 (Bedside Drawer)**: Use the screwdriver to attach the handle. Reveals the mat puzzle clue.
- **Puzzle 3 (4-Icon Lockbox)**: Order is **`Lotus, Conch, Om, Mace`**.
- **Rewards**:
  - `Artefact_Fragment` (Left half of the medallion).
  - Bedroom Exit Key to unlock the door.

---

### Level 2: Dark Diya Maze
- **Primary Goal**: Navigate the dark stone labyrinth to reach the exit gateway at `(1385, 140)`.
- **Mechanics**:
  - Pick up the golden Diya at `(540, 910)`. The Diya casts dynamic line-of-sight illumination.
  - Avoid moving Vighna shadow obstacles that patrol the corridors.
  - Collisions with stone walls down to `y: 96` and solid hitboxes on idol stands prevent climbing or wall clipping.
- **Shrines**:
  - NW Idol at `(171, 140)` awards **+10 Astha** and reveals Hint 2 (`DIYA`).
  - SW Idol at `(129, 890)` awards **+5 Astha**.
  - SE Idol at `(1405, 868)` awards **+5 Astha**.

---

### Level 3: The Living Room
- **Primary Goal**: Reunite the two halves of the circular artefact and unlock the exit door.
- **Mechanics**:
  - Examine the Sofa, Piano, Laptop, and Trophy Cabinet to hear acoustic Morse whispers.
  - In-world plant interactable opens the **Morse Code Reference Chart** (`MorseChartModal.ts`), which displays standard Morse code for `A–Z` and `0–9`.
- **Puzzle 1 (Secret Locker)**:
  - Morse clues spell **`... .... .. ...-`** = **`SHIV`**.
  - Entering `SHIV` on the locker keyboard opens the compartment, granting `Artefact_Fragment_2`.
  - Both fragments automatically combine into the **`Completed_Artefact`** and award **+10 Astha** (reaching 50/50), unlocking Hint 3 (`TRIDENT`).
- **Puzzle 2 (Exit Door Keypad)**:
  - 4 wall portraits (Morse, Newton, Einstein, Raman) reveal numeric Morse sequences **`----. ..--- --... --...`** = **`9277`**.
  - Entering `9277` unlocks the exit door to the transition screen.

---

### Level 4: The Final Sanctuary
- **Primary Goal**: Awaken the sacred temple mechanism and enter Bappa's sanctum.
- **Mechanics**:
  - Central pedestal at `(656, 518)` and Lord Ganesha's idol at `(656, 235)` have solid collision hitboxes preventing walking or climbing on them.
  - Praying at the idol grants **+50 Astha** (reaching 100/100) and displays Hint 4 (`TEMPLE`) along with the full pilgrimage order.
- **Puzzle (Sacred Image Mechanism)**:
  - Insert the `Completed_Artefact` into the pedestal slot.
  - An interactive dial with 8 image seals opens (`Elephant`, `Diya`, `Trident`, `Temple`, `Modak`, `Mouse`, `Lotus`, `Bell`).
  - Tap the 4 symbols in the chronological order of your pilgrimage:
    1. **`Elephant`** (Bedroom)
    2. **`Diya`** (Dark Maze)
    3. **`Trident`** (Living Room)
    4. **`Temple`** (Sanctuary)
- **Ending**:
  - The mechanism aligns, opening a divine beam of golden sanctum light.
  - Stepping into the sanctum triggers the cinematic golden screen transition and leads to the **Game Complete Outro Scene**.
