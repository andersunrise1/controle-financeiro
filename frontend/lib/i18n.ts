export type Locale = "pt" | "en" | "es";

const pt = {
  logout: "Sair",
  greeting: "Olá,",
  loadingDashboard: "Carregando dashboard...",
  loading: "Carregando...",

  loginTitle: "Entrar",
  loginSubtitle: "Acesse seu painel financeiro",
  emailLabel: "E-mail",
  emailPlaceholder: "seu@email.com",
  passwordLabel: "Senha",
  passwordPlaceholder: "Mínimo 6 caracteres",
  loginButton: "Entrar",
  loginButtonLoading: "Entrando...",
  noAccount: "Não tem conta?",
  signUpLink: "Cadastre-se",

  registerTitle: "Cadastro",
  registerSubtitle: "Crie sua conta gratuitamente",
  nameLabel: "Nome",
  namePlaceholder: "Seu nome",
  registerButton: "Cadastrar",
  registerButtonLoading: "Cadastrando...",
  haveAccount: "Já tem conta?",
  loginLink: "Faça login",

  balanceLabel: "Saldo Atual",
  incomeLabel: "Entradas",
  expenseLabel: "Saídas",
  chartTitle: "Entradas vs Saídas por Mês",
  chartEmpty: "Adicione transações para visualizar o gráfico.",
  categoryChartTitle: "Gastos por Categoria por Mês",
  categoryChartEmpty:
    "Adicione transações para visualizar os gastos por categoria.",
  categoryChartFooter:
    "Cada categoria ganha sua própria cor neon — quanto mais categorias você usar, mais cores aparecem no gráfico.",

  newTransactionTitle: "Nova Transação",
  incomeButton: "Entrada",
  expenseButton: "Saída",
  amountLabel: "Valor (R$)",
  descriptionLabel: "Descrição",
  descriptionPlaceholder: "Ex: Salário, Aluguel...",
  categoryLabel: "Categoria",
  dateLabel: "Data",
  addButton: "Adicionar",
  addButtonLoading: "Salvando...",
  successIncome: "Entrada adicionada!",
  successExpense: "Saída adicionada!",

  historyTitle: "Histórico",
  historyEmpty: "Nenhuma transação registrada ainda.",
  historyNoResults: "Nenhuma transação encontrada para essa busca.",
  searchPlaceholder: "Buscar por descrição ou data...",
  allCategories: "Todas as categorias",
  removeTitle: "Remover",

  yearlyChartTitle: "Gastos por Ano",
  yearlyChartEmpty: "Adicione transações para visualizar os gastos por ano.",
  mostSpentYearLabel: "Ano que você mais gastou:",

  converterTitle: "Conversor de Moedas",
  converterSubtitle: "Útil pra quem está viajando entre países",
  converterFrom: "De",
  converterTo: "Para",
  converterAmountLabel: "Valor",
};

type Dictionary = typeof pt;

const en: Dictionary = {
  logout: "Log out",
  greeting: "Hi,",
  loadingDashboard: "Loading dashboard...",
  loading: "Loading...",

  loginTitle: "Log in",
  loginSubtitle: "Access your financial dashboard",
  emailLabel: "Email",
  emailPlaceholder: "you@email.com",
  passwordLabel: "Password",
  passwordPlaceholder: "At least 6 characters",
  loginButton: "Log in",
  loginButtonLoading: "Logging in...",
  noAccount: "Don't have an account?",
  signUpLink: "Sign up",

  registerTitle: "Sign up",
  registerSubtitle: "Create your free account",
  nameLabel: "Name",
  namePlaceholder: "Your name",
  registerButton: "Sign up",
  registerButtonLoading: "Signing up...",
  haveAccount: "Already have an account?",
  loginLink: "Log in",

  balanceLabel: "Current Balance",
  incomeLabel: "Income",
  expenseLabel: "Expenses",
  chartTitle: "Income vs Expenses by Month",
  chartEmpty: "Add transactions to see the chart.",
  categoryChartTitle: "Spending by Category per Month",
  categoryChartEmpty: "Add transactions to see spending by category.",
  categoryChartFooter:
    "Each category gets its own neon color — the more categories you use, the more colors appear in the chart.",

  newTransactionTitle: "New Transaction",
  incomeButton: "Income",
  expenseButton: "Expense",
  amountLabel: "Amount (R$)",
  descriptionLabel: "Description",
  descriptionPlaceholder: "E.g.: Salary, Rent...",
  categoryLabel: "Category",
  dateLabel: "Date",
  addButton: "Add",
  addButtonLoading: "Saving...",
  successIncome: "Income added!",
  successExpense: "Expense added!",

  historyTitle: "History",
  historyEmpty: "No transactions recorded yet.",
  historyNoResults: "No transactions found for this search.",
  searchPlaceholder: "Search by description or date...",
  allCategories: "All categories",
  removeTitle: "Remove",

  yearlyChartTitle: "Spending by Year",
  yearlyChartEmpty: "Add transactions to see spending by year.",
  mostSpentYearLabel: "Year you spent the most:",

  converterTitle: "Currency Converter",
  converterSubtitle: "Handy for travelers crossing borders",
  converterFrom: "From",
  converterTo: "To",
  converterAmountLabel: "Amount",
};

const es: Dictionary = {
  logout: "Cerrar sesión",
  greeting: "Hola,",
  loadingDashboard: "Cargando panel...",
  loading: "Cargando...",

  loginTitle: "Iniciar sesión",
  loginSubtitle: "Accede a tu panel financiero",
  emailLabel: "Correo electrónico",
  emailPlaceholder: "tu@correo.com",
  passwordLabel: "Contraseña",
  passwordPlaceholder: "Mínimo 6 caracteres",
  loginButton: "Iniciar sesión",
  loginButtonLoading: "Iniciando sesión...",
  noAccount: "¿No tienes cuenta?",
  signUpLink: "Regístrate",

  registerTitle: "Registro",
  registerSubtitle: "Crea tu cuenta gratis",
  nameLabel: "Nombre",
  namePlaceholder: "Tu nombre",
  registerButton: "Registrarse",
  registerButtonLoading: "Registrando...",
  haveAccount: "¿Ya tienes cuenta?",
  loginLink: "Inicia sesión",

  balanceLabel: "Saldo Actual",
  incomeLabel: "Ingresos",
  expenseLabel: "Gastos",
  chartTitle: "Ingresos vs Gastos por Mes",
  chartEmpty: "Agrega transacciones para ver el gráfico.",
  categoryChartTitle: "Gastos por Categoría por Mes",
  categoryChartEmpty: "Agrega transacciones para ver los gastos por categoría.",
  categoryChartFooter:
    "Cada categoría tiene su propio color neón — cuantas más categorías uses, más colores aparecen en el gráfico.",

  newTransactionTitle: "Nueva Transacción",
  incomeButton: "Ingreso",
  expenseButton: "Gasto",
  amountLabel: "Monto (R$)",
  descriptionLabel: "Descripción",
  descriptionPlaceholder: "Ej: Salario, Alquiler...",
  categoryLabel: "Categoría",
  dateLabel: "Fecha",
  addButton: "Agregar",
  addButtonLoading: "Guardando...",
  successIncome: "¡Ingreso agregado!",
  successExpense: "¡Gasto agregado!",

  historyTitle: "Historial",
  historyEmpty: "Aún no hay transacciones registradas.",
  historyNoResults: "No se encontraron transacciones para esta búsqueda.",
  searchPlaceholder: "Buscar por descripción o fecha...",
  allCategories: "Todas las categorías",
  removeTitle: "Eliminar",

  yearlyChartTitle: "Gastos por Año",
  yearlyChartEmpty: "Agrega transacciones para ver los gastos por año.",
  mostSpentYearLabel: "Año en el que más gastaste:",

  converterTitle: "Conversor de Monedas",
  converterSubtitle: "Útil para quienes están viajando entre países",
  converterFrom: "De",
  converterTo: "A",
  converterAmountLabel: "Monto",
};

export const dictionaries: Record<Locale, Dictionary> = { pt, en, es };
export type TranslationKey = keyof Dictionary;

const categoryTranslations: Record<Locale, Record<string, string>> = {
  pt: {
    Salário: "Salário",
    Mercado: "Mercado",
    Moradia: "Moradia",
    Transporte: "Transporte",
    Lazer: "Lazer",
    Saúde: "Saúde",
    Outros: "Outros",
  },
  en: {
    Salário: "Salary",
    Mercado: "Groceries",
    Moradia: "Housing",
    Transporte: "Transportation",
    Lazer: "Leisure",
    Saúde: "Health",
    Outros: "Other",
  },
  es: {
    Salário: "Salario",
    Mercado: "Mercado",
    Moradia: "Vivienda",
    Transporte: "Transporte",
    Lazer: "Ocio",
    Saúde: "Salud",
    Outros: "Otros",
  },
};

export function translateCategory(category: string, locale: Locale): string {
  return categoryTranslations[locale][category] ?? category;
}

// The backend never localizes its responses — every API/validation error
// arrives (or is generated client-side) as this exact Portuguese text.
// This table maps that canonical Portuguese string to the other locales;
// an unmapped string just falls back to the original Portuguese.
const errorTranslations: Record<Exclude<Locale, "pt">, Record<string, string>> = {
  en: {
    "Não autenticado.": "Not authenticated.",
    "Tipo, valor e data são obrigatórios.": "Type, amount and date are required.",
    "Tipo deve ser 'income' ou 'expense'.": "Type must be 'income' or 'expense'.",
    "Informe um valor válido maior que zero.": "Enter a valid amount greater than zero.",
    "Categoria inválida.": "Invalid category.",
    "Erro interno do servidor.": "Internal server error.",
    "ID é obrigatório.": "ID is required.",
    "Transação não encontrada.": "Transaction not found.",
    "Nome, e-mail e senha são obrigatórios.": "Name, email and password are required.",
    "Nome deve ter pelo menos 2 caracteres.": "Name must be at least 2 characters.",
    "Informe um e-mail válido.": "Enter a valid email.",
    "A senha deve ter no mínimo 6 caracteres.": "Password must be at least 6 characters.",
    "Este e-mail já está cadastrado.": "This email is already registered.",
    "E-mail e senha são obrigatórios.": "Email and password are required.",
    "E-mail ou senha incorretos.": "Incorrect email or password.",
    "Informe a data da transação.": "Enter the transaction date.",
    "Erro na requisição.": "Request error.",
    "Erro ao fazer login.": "Error logging in.",
    "Erro ao cadastrar.": "Error signing up.",
    "Erro ao salvar.": "Error saving.",
    "Erro ao remover transação.": "Error deleting transaction.",
  },
  es: {
    "Não autenticado.": "No autenticado.",
    "Tipo, valor e data são obrigatórios.": "Tipo, monto y fecha son obligatorios.",
    "Tipo deve ser 'income' ou 'expense'.": "El tipo debe ser 'income' o 'expense'.",
    "Informe um valor válido maior que zero.": "Ingresa un monto válido mayor que cero.",
    "Categoria inválida.": "Categoría inválida.",
    "Erro interno do servidor.": "Error interno del servidor.",
    "ID é obrigatório.": "El ID es obligatorio.",
    "Transação não encontrada.": "Transacción no encontrada.",
    "Nome, e-mail e senha são obrigatórios.": "Nombre, correo y contraseña son obligatorios.",
    "Nome deve ter pelo menos 2 caracteres.": "El nombre debe tener al menos 2 caracteres.",
    "Informe um e-mail válido.": "Ingresa un correo válido.",
    "A senha deve ter no mínimo 6 caracteres.": "La contraseña debe tener al menos 6 caracteres.",
    "Este e-mail já está cadastrado.": "Este correo ya está registrado.",
    "E-mail e senha são obrigatórios.": "Correo y contraseña son obligatorios.",
    "E-mail ou senha incorretos.": "Correo o contraseña incorrectos.",
    "Informe a data da transação.": "Ingresa la fecha de la transacción.",
    "Erro na requisição.": "Error en la solicitud.",
    "Erro ao fazer login.": "Error al iniciar sesión.",
    "Erro ao cadastrar.": "Error al registrarse.",
    "Erro ao salvar.": "Error al guardar.",
    "Erro ao remover transação.": "Error al eliminar la transacción.",
  },
};

export function translateError(message: string, locale: Locale): string {
  if (locale === "pt") return message;
  return errorTranslations[locale][message] ?? message;
}
