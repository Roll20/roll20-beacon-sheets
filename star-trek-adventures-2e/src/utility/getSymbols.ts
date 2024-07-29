import { type ModifierKey } from "@/system/logicTerms"

export const getOperationSymbol = (operation: ModifierKey) => {
  switch(operation) {
    case "ADD": return "+"
    case "SUBTRACT": return "-"
    case "MULTIPLY": return "×"
    case "DIVIDE": return "÷"
  }
}