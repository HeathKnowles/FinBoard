"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export interface URLParameter {
  key: string;
  value: string;
  description?: string;
}

function parseUrlParameters(url: string): { baseUrl: string; parameters: URLParameter[] } {
  try {
    const urlObj = new URL(url);
    const parameters: URLParameter[] = [];
    
    urlObj.searchParams.forEach((value, key) => {
      parameters.push({
        key,
        value,
        description: getParameterDescription(key)
      });
    });
    
    return {
      baseUrl: `${urlObj.origin}${urlObj.pathname}`,
      parameters
    };
  } catch {

    const parts = url.split('?');
    if (parts.length < 2) {
      return { baseUrl: url, parameters: [] };
    }
    
    const baseUrl = parts[0];
    const queryString = parts.slice(1).join('?');
    const parameters: URLParameter[] = [];
    
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key) {
        parameters.push({
          key: decodeURIComponent(key),
          value: decodeURIComponent(value || ''),
          description: getParameterDescription(key)
        });
      }
    });
    
    return { baseUrl, parameters };
  }
}

function getParameterDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'token': 'API authentication token',
    'apikey': 'API key for authentication',
    'api_key': 'API key for authentication',
    'symbol': 'Stock/crypto ticker symbol',
    'ticker': 'Stock ticker symbol',
    'symbols': 'Comma-separated list of symbols',
    'from': 'Start date (YYYY-MM-DD)',
    'to': 'End date (YYYY-MM-DD)',
    'limit': 'Number of results to return',
    'page': 'Page number for pagination',
    'interval': 'Time interval (1m, 5m, 1h, 1d)',
    'period': 'Time period (1d, 5d, 1mo, 3mo, 1y)',
    'format': 'Response format (json, csv, xml)',
    'currency': 'Currency code (USD, EUR, GBP)',
    'exchange': 'Stock exchange code',
    'market': 'Market identifier',
    'type': 'Data type or category',
    'fields': 'Comma-separated list of fields'
  };
  
  const lowerKey = key.toLowerCase();
  return descriptions[lowerKey] || `Parameter: ${key}`;
}

function reconstructUrl(baseUrl: string, parameters: URLParameter[]): string {
  if (parameters.length === 0) return baseUrl;
  
  const searchParams = new URLSearchParams();
  parameters.forEach(param => {
    if (param.key && param.value) {
      searchParams.append(param.key, param.value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

interface URLParameterEditorProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  onTest?: () => void;
  testLoading?: boolean;
  className?: string;
}

export function URLParameterEditor({
  value,
  onChange,
  placeholder = "https://api.example.com/data?param=value",
  onTest,
  testLoading = false,
  className = ""
}: URLParameterEditorProps) {
  const [baseUrl, setBaseUrl] = useState("");
  const [urlParameters, setUrlParameters] = useState<URLParameter[]>([]);

  useEffect(() => {
    if (value.trim()) {
      const { baseUrl: parsedBaseUrl, parameters } = parseUrlParameters(value);
      setBaseUrl(parsedBaseUrl);
      setUrlParameters(parameters);
    } else {
      setBaseUrl("");
      setUrlParameters([]);
    }
  }, [value]);

  const updateUrl = useCallback(() => {
    const newUrl = reconstructUrl(baseUrl, urlParameters);
    onChange(newUrl);
  }, [baseUrl, urlParameters, onChange]);

  const handleParameterChange = useCallback((index: number, field: 'key' | 'value', newValue: string) => {
    setUrlParameters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: newValue };
      return updated;
    });
  }, []);

  const handleParameterKeyDown = useCallback((e: React.KeyboardEvent, index: number, field: 'key' | 'value') => {
    if (e.key === 'Backspace') {
      const input = e.target as HTMLInputElement;

      if (input.value.length > 0 || input.selectionStart !== 0) {
        return;
      }
      e.preventDefault();
    }
  }, []);

  const addParameter = useCallback(() => {
    setUrlParameters(prev => [...prev, { key: '', value: '', description: 'New parameter' }]);
  }, []);

  const removeParameter = useCallback((index: number) => {
    setUrlParameters(prev => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    if (baseUrl) {
      updateUrl();
    }
  }, [baseUrl, urlParameters, updateUrl]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium text-gray-200">API URL</Label>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500 min-h-10"
        />
        {onTest && (
          <Button
            className="bg-green-500 hover:bg-green-600 text-white font-medium transition-colors w-full sm:w-auto whitespace-nowrap"
            type="button"
            onClick={onTest}
            disabled={testLoading}
          >
            <svg width={16} height={16} className="mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 12l2 2 4-4" />
              <circle cx={12} cy={12} r={10} />
            </svg>
            {testLoading ? "Testing..." : "Test"}
          </Button>
        )}
      </div>

      {baseUrl && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-300">Base URL</Label>
          <div className="p-2 bg-gray-700 rounded border text-sm font-mono text-gray-300 break-all">
            {baseUrl}
          </div>
        </div>
      )}

      {urlParameters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-300">Query Parameters</Label>
            <Badge variant="secondary" className="text-xs">
              {urlParameters.length} parameter{urlParameters.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {urlParameters.map((param, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-700/50 rounded border">
                <div className="col-span-4">
                  <Input
                    value={param.key}
                    onChange={(e) => handleParameterChange(index, 'key', e.target.value)}
                    onKeyDown={(e) => handleParameterKeyDown(e, index, 'key')}
                    placeholder="key"
                    className="text-xs bg-gray-600 border-gray-500 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="col-span-7">
                  <Input
                    value={param.value}
                    onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                    onKeyDown={(e) => handleParameterKeyDown(e, index, 'value')}
                    placeholder="value"
                    className="text-xs bg-gray-600 border-gray-500 text-white placeholder:text-gray-400"
                  />
                  {param.description && (
                    <div className="text-xs text-gray-400 mt-1 truncate" title={param.description}>
                      {param.description}
                    </div>
                  )}
                </div>

                <div className="col-span-1 flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeParameter(index)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={addParameter}
            className="w-full text-xs bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
          >
            + Add Parameter
          </Button>
        </div>
      )}

      {urlParameters.length === 0 && baseUrl && (
        <Button
          size="sm"
          variant="outline"
          onClick={addParameter}
          className="w-full text-xs bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
        >
          + Add Query Parameter
        </Button>
      )}
    </div>
  );
}