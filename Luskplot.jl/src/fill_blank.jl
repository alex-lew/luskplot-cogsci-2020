using Gen
using Memoize
using LRUCache

# Recommended padding text for XLNet.
const PADDING_TEXT = "In 1991, the remains of Russian Tsar Nicholas II and his family (except for Alexei and Maria) are discovered. The voice of Nicholas's young son, Tsarevich Alexei Nikolaevich, narrates the remainder of the story. 1883 Western Siberia, a young Grigori Rasputin is asked by his father and a group of men to perform magic. Rasputin has a vision and denounces one of the men as a horse thief. Although his father initially slaps him for making such an accusation, Rasputin watches as the man is chased outside and beaten. Twenty years later, Rasputin sees a vision of the Virgin Mary, prompting him to become a priest. Rasputin quickly becomes famous, with people, even a bishop, begging for his blessing. <eod> </s> <eos>"

# Softmax
softmax(arr) = exp.(arr .- logsumexp(arr))

lru() = LRU{Tuple{String, Int}, Vector{Float64}}(maxsize=100)
@memoize lru function xl_masked_word_logits(text_with_mask::String, which_mask::Int = 1)
  text_with_mask = replace(text_with_mask, "[?]" => "<mask>")
  input_ids = torch.tensor(xltokenizer.encode("$(PADDING_TEXT)$(text_with_mask)", add_special_tokens=true)).unsqueeze(0)
  # 6 == <mask>
  mask_indices = [i-1 for (i, x) in enumerate(input_ids.tolist()[1,1:end]) if x == 6]
  perm_mask = torch.zeros((1, input_ids.shape[2], input_ids.shape[2]), dtype=torch.float)
  for i=0:input_ids.shape[2] - 1
    set!(perm_mask, (0, i, mask_indices), 1.0)
  end
  target_mapping = torch.zeros((1, length(mask_indices), input_ids.shape[2]), dtype=torch.float)
  for (i, j) in enumerate(mask_indices)
    set!(target_mapping, (0, i-1, j), 1.0)
  end
  outputs = xlmodel(input_ids, perm_mask=perm_mask, target_mapping=target_mapping)
  next_token_logits = outputs[1]
  return get(next_token_logits, (0, which_mask-1)).tolist()
end

function xl_masked_word_logits_within_candidates(text_with_mask::String, possibilities::Vector{String}, which_mask=1)
  possible_tokens = torch.tensor([xltokenizer.encode(word)[1]+1 for word in possibilities])
  return xl_masked_word_logits(text_with_mask, which_mask)[possible_tokens.tolist()]
end

function word_probs_xl(prompt, which_mask=1)
  return softmax(xl_masked_word_logits(prompt, which_mask))
end

function word_probs_xl(prompt, words::Vector{String}, which_mask=1)
  softmax(xl_masked_word_logits_within_candidates(prompt, words, which_mask))
end

@dist fill_blank(prompt) = xlvocab[categorical(word_probs_xl(prompt))]
@dist fill_blank_from_list(prompt, words) = words[categorical(word_probs_xl(prompt, words))]
@dist fill_nth_blank(prompt, n) = xlvocab[categorical(word_probs_xl(prompt, n))]
@dist fill_nth_blank_from_list(prompt, words, n) = words[categorical(word_probs_xl(prompt, words, n))]

export fill_blank, fill_blank_from_list, fill_nth_blank, fill_nth_blank_from_list
