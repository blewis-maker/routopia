export class ChatResponseFormatter {
  formatResponse(response: EnhancedRouteWithSuggestion): string {
    const { insights, warnings, suggestions } = response;
    
    // Format main insights
    const formattedInsights = insights.map(insight => `🎯 ${insight}`).join('\n');
    
    // Format weather warnings if any
    const formattedWarnings = warnings.length > 0 
      ? '\n\n⚠️ Weather Alerts:\n' + warnings.map(w => `• ${w}`).join('\n')
      : '';
    
    // Format suggestions
    const formattedSuggestions = suggestions.length > 0
      ? '\n\n💡 Suggestions:\n' + suggestions.map(s => `• ${s}`).join('\n')
      : '';

    return `${formattedInsights}${formattedWarnings}${formattedSuggestions}`;
  }
} 