using Gen

struct Elaborate <: Distribution{String} end

"""
    elaborate(prompt, num_tokens)

Uses GPT-2 to elaborate on a prompt for a certain number of tokens.
"""
const elaborate = Elaborate()


const elaborate_logpdf_cache = Dict{Tuple{String,String},Float64}()
function Gen.logpdf(::Elaborate, observed::String, prompt::String, num_tokens::Int)
  get!(elaborate_logpdf_cache, (prompt, observed)) do
    @pywith torch.no_grad() begin
      prompt_encoding = gpt2tokenizer.encode(prompt)
      total_encoding = gpt2tokenizer.encode("$prompt$observed")
      inputs = torch.tensor(total_encoding, dtype=torch.long).unsqueeze(0).repeat(1,1)
      labels = torch.tensor([fill(-1, length(prompt_encoding))..., total_encoding[length(prompt_encoding)+1:end]...]).unsqueeze(0).repeat(1,1)
      return -gpt2model(input_ids=inputs, labels=labels)[1].tolist()[1] * (length(total_encoding) - length(prompt_encoding))
    end
  end
end

function Gen.random(::Elaborate, prompt::String, num_tokens::Int)
  # Create context encoding from prompt string.
  context = torch.tensor(gpt2tokenizer.encode(prompt), dtype=torch.long).unsqueeze(0).repeat(1, 1)
  prompt_length = length(get(context, 0))

  @pywith torch.no_grad() begin
    for i=1:num_tokens
      # Run GPT-2 on the context so far
      outputs, = gpt2model(input_ids=context)

      # Sample a next token
      next_token_logits = get(outputs, (0, -1))
      next_token = torch.multinomial(torch.nn.functional.softmax(next_token_logits,dim=-1), num_samples=1)

      # Update context
      context = torch.cat((context, next_token.unsqueeze(0)), dim=1)
    end
    return gpt2tokenizer.decode(get(context, 0).tolist()[prompt_length+1:end])
  end
end

(::Elaborate)(prompt::String, num_tokens::Int) = Gen.random(Elaborate(), prompt, num_tokens)
Gen.has_output_grad(::Elaborate) = false
Gen.has_argument_grads(::Elaborate) = (false,false)

# const gpt2_score_text_pieces = language_models.scoreTextPieces

export elaborate
